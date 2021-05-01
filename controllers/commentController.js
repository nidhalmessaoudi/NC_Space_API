import Comment from "../models/Comment.js";
import * as handlerFactory from "./handlerFactory.js";

export const getAllComments = handlerFactory.getAll(Comment);
export const getComment = handlerFactory.getOne(Comment);
export const createComment = handlerFactory.createOne(Comment);
export const updateComment = handlerFactory.updateOne(Comment);
export const deleteComment = handlerFactory.deleteOne(Comment);
