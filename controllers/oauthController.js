import axios from "axios";
import { google } from "googleapis";

import User from "../models/User.js";
import { createAndSendToken } from "./authController.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

const { OAuth2 } = google.auth;

const oauth2Credentials = {
  client_id:
    "42330238853-kehjbqn3ufmjvmfuklh496rdjulrl23k.apps.googleusercontent.com",
  project_id: "NC Space",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_secret: "6ZX0gqSyxMETU96pUadw6fpW",
  redirect_uri: "http://localhost:8000/api/v1/users/auth/google",
  scopes: [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ],
};

const oauth2Client = new OAuth2(
  oauth2Credentials.client_id,
  oauth2Credentials.client_secret,
  oauth2Credentials.redirect_uri
);

export const getGoogleLogin = (req, res, next) => {
  const link = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: oauth2Credentials.scopes,
  });

  res.status(200).json({
    status: "success",
    googleLoginLink: link,
  });
};

export const getGoogleRedirect = catchAsync(async (req, res, next) => {
  if (req.query.error) {
    return next(
      new AppError("You haven't authorize us. Please try again", 401)
    );
  } else {
    // GET ACCESS AND ID TOKEN
    const { tokens } = await oauth2Client.getToken(req.query.code);

    // GET GOOGLE USER
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.id_token}`,
        },
      }
    );

    const googleUser = response.data;
    googleUser.from = "googleapis";

    // CHECK IF THE USER ALREADY EXISTS IN THE DATABASE
    const userExists = await User.get(undefined, {
      fromGoogle: true,
      googleId: googleUser.id,
    });

    // IF EXISTS => CREATE AND SEND TOKEN TO THE CLIENT (MEANS LOGIN USER)
    // IF NO => SO CREATE THE NEW USER AND DO THE STEPS UP
    if (userExists) {
      createAndSendToken(res, userExists, 200);
    } else {
      const newUser = {
        email: googleUser.email,
        name: googleUser.name,
        photo: googleUser.picture,
        verified: googleUser.verified_email ? true : false,
        fromGoogle: true,
        googleId: googleUser.id,
      };
      const user = await User.save(newUser, { validateBeforeSave: false });
      createAndSendToken(res, user, 200);
    }
  }
});
