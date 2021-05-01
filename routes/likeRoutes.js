import express from "express";

import * as likeController from "../controllers/likeController.js";
import setArticleAndUserIds from "../utils/helperNestedRoutes.js";
import { protect } from "../controllers/authController.js";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(protect, setArticleAndUserIds, likeController.getAllLikes)
  .post(protect, likeController.createOrDeleteLike);

router.get("/:id", likeController.getLike);

export default router;
