import Like from "../models/Like.js";
import catchAsync from "../utils/catchAsync.js";
import * as handlerFactory from "./handlerFactory.js";

export const getAllLikes = handlerFactory.getAll(Like);
export const getLike = handlerFactory.getOne(Like);

export const createOrDeleteLike = catchAsync(async (req, res, next) => {
  // ALLOW NESTED ROUTES
  if (!req.body.article) req.body.article = req.params.articleId;
  if (!req.body.user) req.body.user = req.user.id;

  // CHECK IF THE LIKE ALREADY EXISTS
  const like = await Like.get({
    article: req.body.article,
    user: req.body.user,
  });

  if (like) {
    await Like.deleteById(like._id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } else {
    const newLike = await Like.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        like: newLike,
      },
    });
  }
});
