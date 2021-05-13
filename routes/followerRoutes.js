import express from "express";

import { protect } from "../controllers/authController.js";
import * as followerController from "../controllers/followerController.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(followerController.getAllFollowers)
  .post(followerController.createOrDeleteFollower);

router.get("/:id", followerController.getFollower);

export default router;
