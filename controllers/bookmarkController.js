import Bookmark from "../models/Bookmark.js";
import * as handlerFactory from "./handlerFactory.js";

export const getAllBookmarks = handlerFactory.getAll(Bookmark);
export const createOrDeleteBookmark = handlerFactory.createOrDeleteOne(
  Bookmark
);
export const getBookmark = handlerFactory.getOne(Bookmark);
