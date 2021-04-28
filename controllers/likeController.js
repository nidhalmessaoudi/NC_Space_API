import Like from "../models/Like.js";
import AppError from "../utils/AppError.js";
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
  // ALLOW NESTED ROUTES
  if (!req.body.article) req.body.article = req.params.articleId;
  if (!req.body.user) req.body.user = req.user.id;

  // CHECK IF THE LIKE ALREADY EXISTS
  const like = await Like.getLike({
    article: req.body.article,
    user: req.body.user,
  });

  if (like) {
    await Like.deleteLikeById(like._id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } else {
    const newLike = await Like.createLike(req.body);

    res.status(201).json({
      status: "success",
      data: {
        like: newLike,
      },
    });
  }
});
