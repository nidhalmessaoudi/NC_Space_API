import Comment from "../models/Comment.js";
import catchAsync from "../utils/catchAsync.js";

export const getAllComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.getAllComments();

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

  const newComment = await Comment.createComment(req.body);

  res.status(201).json({
    status: "success",
    data: {
      comment: newComment,
    },
  });
});