import Follower from "../models/Follower.js";
import * as handlerFactory from "./handlerFactory.js";

export const getAllFollowers = handlerFactory.getAll(Follower);
export const createOrDeleteFollower = handlerFactory.createOrDeleteOne(
  Follower
);
export const getFollower = handlerFactory.getOne(Follower);
