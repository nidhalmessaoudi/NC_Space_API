import axios from "axios";
import { stringify } from "query-string";
import { google } from "googleapis";

import User from "../models/User.js";
import { signToken, createJWTCookie } from "./authController.js";
import catchAsync from "../utils/catchAsync.js";

// HELPER FUNCTIONS
const getRedirectUrl = () => {
  // CLIENT APP REDIRECT URL
  return process.env.NODE_ENV === "development"
    ? process.env.DEV_CLIENT_URL
    : process.env.PROD_CLIENT_URL;
};
const denyError = (res) => {
  const redirectUrl = getRedirectUrl();
  res
    .status(400)
    .redirect(
      `${redirectUrl}?error_message=${encodeURIComponent(
        "You haven't authorize us! Please try again."
      )}`
    );
};

const handleUnexpectedErr = (res) => {
  const redirectUrl = getRedirectUrl();
  res
    .status(400)
    .redirect(
      `${redirectUrl}?error_message=${encodeURIComponent(
        "Something went wrong during the login process! Please try again later."
      )}`
    );
};

const createAndSendUserFromOAuth = async (res, user, from, next) => {
  const redirectUrl = getRedirectUrl();
  // CHECK IF THE USER ALREADY EXISTS IN THE DATABASE
  const userExists = await User.get(undefined, {
    from,
    [from === "google" ? "googleId" : "facebookId"]: user.id,
  });

  // IF EXISTS => CREATE AND SEND TOKEN TO THE CLIENT (MEANS LOGIN USER)
  // IF NO => SO CREATE THE NEW USER AND DO THE STEPS UP
  if (userExists) {
    const token = signToken(userExists.id);
    createJWTCookie(res, token);
    res
      .status(200)
      .redirect(
        `${redirectUrl}?message=${encodeURIComponent(
          `Welcome back ${userExists.name}!`
        )}`
      );
  } else {
    const sameEmailUser = await User.get(undefined, {
      email: user.email,
    });
    if (sameEmailUser) {
      const resMessage = `You already joined using ${
        sameEmailUser.from ? sameEmailUser.from : "email"
      }!`;
      res
        .status(400)
        .redirect(`${redirectUrl}?message=${encodeURIComponent(resMessage)}`);
      return;
    }
    const newUser = {
      email: user.email,
      name: user.name,
      photo: user.picture,
      verified: user.verified_email ? true : false,
      from: user.from,
      birthday: user.birthday,
      gender: user.gender,
      [from === "google" ? "googleId" : "facebookId"]: user.id,
    };
    const savedUser = await User.save(newUser, { validateBeforeSave: false });
    const token = signToken(savedUser.id);
    createJWTCookie(res, token);
    res
      .status(200)
      .redirect(
        `${redirectUrl}?message=${encodeURIComponent(
          `Hello and thank you for joing us ${savedUser.name}!`
        )}`
      );
  }
};

// FOR GOOGLE
const setupOAuthClient = () => {
  const { OAuth2 } = google.auth;

  const oauth2Credentials = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    project_id: "NC Space",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: "http://localhost:8000/api/v1/users/auth/google",
  };

  return new OAuth2(
    oauth2Credentials.client_id,
    oauth2Credentials.client_secret,
    oauth2Credentials.redirect_uri
  );
};

export const getGoogleLogin = (req, res, next) => {
  const oauth2Client = setupOAuthClient();

  const link = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  });

  res.status(200).json({
    status: "success",
    googleLoginLink: link,
  });
};

export const getGoogleRedirect = catchAsync(async (req, res, next) => {
  const oauth2Client = setupOAuthClient();

  if (req.query.error) return denyError(res);
  if (req.query.error_code) return handleUnexpectedErr(res);
  else {
    // GET ACCESS AND ID TOKEN
    const { tokens } = await oauth2Client.getToken(req.query.code);

    // GET GOOGLE USER
    const response = await axios({
      url: `https://www.googleapis.com/oauth2/v1/userinfo`,
      method: "get",
      headers: {
        Authorization: `Bearer ${tokens.id_token}`,
      },
      params: {
        alt: "json",
        access_token: tokens.access_token,
      },
    });

    const googleUser = response.data;
    googleUser.from = "google";

    createAndSendUserFromOAuth(res, googleUser, "google", next);
  }
});

// FOR FACEBOOK
export const getFbLogin = (req, res, next) => {
  const fbLoginUrlParams = stringify({
    client_id: process.env.FB_CLIENT_ID,
    redirect_uri: "http://localhost:8000/api/v1/users/auth/facebook",
    scope: "email",
    response_type: "code",
    auth_type: "rerequest",
  });

  const fbLoginUrl = `https://www.facebook.com/v10.0/dialog/oauth?${fbLoginUrlParams}`;

  res.status(200).json({
    status: "success",
    facebookLoginLink: fbLoginUrl,
  });
};

export const getFbRedirect = catchAsync(async (req, res, next) => {
  if (req.query.error) return denyError(res);
  if (req.query.error_code) return handleUnexpectedErr(res);
  else {
    const { data } = await axios({
      url: "https://graph.facebook.com/v10.0/oauth/access_token",
      method: "get",
      params: {
        client_id: process.env.FB_CLIENT_ID,
        client_secret: process.env.FB_CLIENT_SECRET,
        redirect_uri: "http://localhost:8000/api/v1/users/auth/facebook",
        code: req.query.code,
      },
    });

    const response = await axios({
      url: "https://graph.facebook.com/me",
      method: "get",
      params: {
        access_token: data.access_token,
        fields: "id,name,email,picture",
      },
    });

    const fbUser = response.data;
    fbUser.picture = fbUser.picture.data.url;
    fbUser.verified_email = true;
    fbUser.from = "facebook";

    createAndSendUserFromOAuth(res, fbUser, "facebook", next);
  }
});
