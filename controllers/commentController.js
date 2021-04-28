import Comment from "../models/Comment.js";
import catchAsync from "../utils/catchAsync.js";
import * as handlerFactory from "./handlerFactory.js";

export const getAllComments = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.params.articleId) filter = { article: req.params.articleId };

  const comments = await Comment.getAll(filter);

  res.status(200).json({
    status: "success",
    results: comments.length,
    data: {
      comments,
    },
  });
});

export const createComment = catchAsync(async (req, res, next) => {
  // ALLOW NESTED ROUTES
  if (!req.body.article) req.body.article = req.params.articleId;
  if (!req.body.author) req.body.author = req.user.id;

  const newComment = await Comment.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      comment: newComment,
    },
  });
});

export const deleteComment = handlerFactory.deleteOne(Comment);
