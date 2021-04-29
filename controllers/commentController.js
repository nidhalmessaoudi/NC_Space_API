import Comment from "../models/Comment.js";
import catchAsync from "../utils/catchAsync.js";
import * as handlerFactory from "./handlerFactory.js";

export const setArticleAndUserIds = (req, res, next) => {
  // ALLOW NESTED ROUTES
  if (!req.body.article) req.body.article = req.params.articleId;
  if (!req.body.author) req.body.author = req.user.id;
  next();
};

export const getAllComments = handlerFactory.getAll(Comment);
export const getComment = handlerFactory.getOne(Comment);
export const createComment = handlerFactory.createOne(Comment);
export const updateComment = handlerFactory.updateOne(Comment);
export const deleteComment = handlerFactory.deleteOne(Comment);
