import Like from "../models/Like.js";
import * as handlerFactory from "./handlerFactory.js";

export const getAllLikes = handlerFactory.getAll(Like);
export const createOrDeleteLike = handlerFactory.createOrDeleteOne(Like);
export const getLike = handlerFactory.getOne(Like);
