import { promisify } from "util";

import jwt from "jsonwebtoken";

import User from "../models/User.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import sendEmail from "../utils/email.js";
import encrypt from "../utils/encrypt.js";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const generateRandomToken = async (user, expireTime) => {
  const randomToken = await user.createToken(expireTime);
  await User.save(user, { validateBeforeSave: false });

  return randomToken;
};

const sendRandomToken = async (user, subject, message, next) => {
  try {
    await sendEmail({
      email: user.email,
      subject,
      message,
    });
  } catch (err) {
    if (user.verifyToken) {
      user.verifyToken = undefined;
      user.verifyTokenExpires = undefined;
      await User.save(user, { validateBeforeSave: false });
    } else {
      user.resetToken = undefined;
      user.resetTokenExpires = undefined;
      await User.save(user, { validateBeforeSave: false });
    }

    return next(
      new AppError(
        "There was an error sending the email. Try again or contact support!",
        500
      )
    );
  }
};

export const createAndSendToken = (
  res,
  user,
  statusCode,
  state = undefined
) => {
  const token = signToken(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  if (state)
    res.status(statusCode).json({
      status: "success",
      token,
      message:
        "Thank you for joing us, Please check your inbox, email verification sent!",
    });
  else
    res.status(statusCode).json({
      status: "success",
      token,
      data: {
        user,
      },
    });
};

const checkUserEmailAndPassword = async (req, next) => {
  const { email, password } = req.body;

  // CHECK IF EMAIL AND PASSWORD EXIST
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  // CHECK IF USER EXISTS => PASSWORD IS CORRECT ✔
  const user = await User.getByEmail(email);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  return user;
};

export const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.createUser(req.body);

  // GENERATE RANDOM VERIFY TOKEN
  const verifyToken = await generateRandomToken(newUser, 5);

  // SEND IT TO USER'S EMAIL
  const verifyURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/verify-email/${verifyToken}`;

  const message = `Hello ${newUser.name}, Thank you for joing us in the NC Space community!
    In order to complete your sign up, please follow this link: ${verifyURL}
    Enjoy your time with us!`;

  const subject = `NC Space email verification for ${newUser.name}. Valid for 5 mins`;

  sendRandomToken(newUser, subject, message, next);

  createAndSendToken(res, newUser, 200, "signup");
});

export const sendVerifyEmail = catchAsync(async (req, res, next) => {
  const user = req.user;

  // CHECK IF USER IS VERIFIED OR NOT
  if (user.verified)
    return next(new AppError("You are already verified!", 400));

  // GENERATE RANDOM VERIFY TOKEN
  const verifyToken = await generateRandomToken(user, 5);

  // SEND IT TO USER'S EMAIL
  const verifyURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/verify-email/${verifyToken}`;

  const message = `Hello ${user.name}, Thank you for joing us in the NC Space community!
    In order to complete your sign up, please follow this link: ${verifyURL}
    Enjoy your time with us!`;

  const subject = `NC Space email verification for ${user.name} (valid for 5 mins)`;

  sendRandomToken(user, subject, message, next);

  res.status(200).json({
    status: "success",
    message: "Please check your inbox, email verification sent!",
  });
});

export const verifyEmail = catchAsync(async (req, res, next) => {
  // GET USER BASED ON THE TOKEN
  const hashedToken = encrypt(req.params.token);

  const user = await User.get(undefined, {
    verifyToken: hashedToken,
    verifyTokenExpires: { $gt: Date.now() },
  });

  // IF TOKEN NOT EXPIRED AND THERE IS USER => SET USER AS VERIFIED
  if (!user)
    return next(
      new AppError("Token verification is invalid or has expired!", 400)
    );

  user.verified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpires = undefined;

  await User.save(user, { validateBeforeSave: false });

  // LOG THE USER IN, SEND TOKEN
  createAndSendToken(res, user, 200);
});

export const login = catchAsync(async (req, res, next) => {
  const user = await checkUserEmailAndPassword(req, next);
  if (!user) return;

  // CHECK IF EVTHG IS OK, SEND TOKEN TO CLIENT
  createAndSendToken(res, user, 200);
});

export const protect = catchAsync(async (req, res, next) => {
  // GETTING AND CHECKING IF THE TOKEN EXISTS
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please login first.", 401)
    );
  }

  // TOKEN VERIFICATION
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // CHECK IF USER EXISTS
  const currentUser = await User.getById(decoded.id);

  if (!currentUser)
    return next(
      new AppError("The user belonging to this token does NOT exist!", 401)
    );

  // CHECK IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED
  if (currentUser.isChangedAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please try again.", 401)
    );
  }

  // IF ALL PASSED, GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role) || !req.user.verified) {
      return next(
        new AppError("You do NOT have permission to perform this action", 403)
      );
    }

    next();
  };
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  // GET USER BASED ON POSTED EMAIL
  const user = await User.getByEmail(req.body.email);

  if (!user)
    return next(new AppError("There is no user with this email adress!", 404));

  // GENERATE RANDOM RESET TOKEN
  const resetToken = await generateRandomToken(user, 10);

  // SEND IT TO USER'S EMAIL
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and its confirm to:
    ${resetURL}\nIf you didn't forget your password,please ignore this email! `;

  const subject = "Your password reset token (valid for 10 mins)";

  sendRandomToken(user, subject, message, next);

  res.status(200).json({
    status: "success",
    message: "Token sent to email!",
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  // GET USER BASED ON THE TOKEN
  const hashedToken = encrypt(req.params.token);

  const user = await User.get(undefined, {
    resetToken: hashedToken,
    resetTokenExpires: { $gt: Date.now() },
  });

  // IF TOKEN NOT EXPIRED AND THERE IS USER => SET THE NEW PASSWORD
  if (!user) return next(new AppError("Token is invalid or has expired!", 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;

  await User.save(user);

  // UPDATE THE changedPasswordAt PROPERTY FOR THE USER

  // LOG THE USER IN, SEND JWT
  createAndSendToken(res, user, 200);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  // GET USER FROM COLLECTION
  const user = await User.getById(req.user._id, "+password");

  // CHECK IF THE USER CURRENT PASSWORD IS CORRECT
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError("Your current password is wrong!", 401));
  }

  // IF SO => UPDATE THE PASSWORD
  const { newPassword, newPasswordConfirm } = req.body;

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;

  await User.save(user);

  // LOG USER IN, SEND JWT
  createAndSendToken(res, user, 200);
});
