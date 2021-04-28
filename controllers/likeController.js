import Like from "../models/Like.js";
import catchAsync from "../utils/catchAsync.js";

export const getAllLikes = catchAsync(async (req, res, next) => {
  const likes = await Like.getAllLikes();

  res.status(200).json({
    status: "success",
    results: likes.length,
    data: {
      likes,
    },
  });
});

export const createLike = catchAsync(async (req, res, next) => {
  const newLike = await Like.createLike(req.body);

  res.status(200).json({
    status: "success",
    data: {
      like: newLike,
    },
  });
});
