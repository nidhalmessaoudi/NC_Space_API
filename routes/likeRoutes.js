import express from "express";

import * as likeController from "../controllers/likeController.js";
import setArticleAndUserIds from "../utils/helperNestedRoutes.js";
import { protect } from "../controllers/authController.js";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(likeController.getAllLikes)
  .post(protect, setArticleAndUserIds, likeController.createOrDeleteLike);

router.get("/:id", protect, likeController.getLike);

export default router;
