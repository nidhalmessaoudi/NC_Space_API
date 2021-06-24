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

export const getAllUsers = handlerFactory.getAll(User);
export const getUser = handlerFactory.getOne(User);
export const updateUser = handlerFactory.updateOne(User);
export const deleteUser = handlerFactory.deleteOne(User);

export const getPublicUser = catchAsync(async (req, res, next) => {
  if (!req.params.username)
    return next(new AppError("Please provide a valid username!", 400));

  const user = await User.getByUsername(req.params.username, {
    name: 1,
    username: 1,
    email: 1,
    photo: 1,
    role: 1,
    numberOfFollowers: 1,
    numberOfFollowings: 1,
  });

  if (!user)
    return next(new AppError("No user was found with this username!", 404));

  const publicUser = user.toObject();
  delete publicUser.bookmarks;
  if (publicUser.role === "user") delete publicUser.myArticles;

  res.status(200).json({
    status: "success",
    data: {
      user: publicUser,
    },
  });
});

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

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
    message: "This route is NOT defined! Please /signup instead.",
  });
};
