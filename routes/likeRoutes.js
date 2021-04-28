import express from "express";

import * as likeController from "../controllers/likeController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(protect, likeController.getAllLikes)
  .post(protect, likeController.createOrDeleteLike);

export default router;
