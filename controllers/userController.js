import User from "../models/User.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import * as handlerFactory from "./handlerFactory.js";

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.getAll();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

export const updateMe = catchAsync(async (req, res, next) => {
  // CREATE ERROR IF USER POSTS PASSWORD DATA
  if (req.body.newPassword || req.body.newPasswordConfirm) {
    return next(
      new AppError(
        "This route is NOT for password updates. Please use /update-password",
        400
      )
    );
  }

  // FILTER OUT UNWANTED FIELDS
  const filteredBody = filterObj(req.body, "name", "email");

  // UPDATE USER DOCUMENT
  const updatedUser = await User.update(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.update(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const createUser = (req, res, next) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

export const getUser = (req, res, next) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

export const updateUser = (req, res, next) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

export const deleteUser = handlerFactory.deleteOne(User);
