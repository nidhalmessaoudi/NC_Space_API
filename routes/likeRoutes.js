import express from "express";

import * as likeController from "../controllers/likeController.js";
import setArticleAndUserIds from "../utils/helperNestedRoutes.js";
import { protect } from "../controllers/authController.js";

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route("/")
  .get(setArticleAndUserIds, likeController.getAllLikes)
  .post(likeController.createOrDeleteLike);

router.get("/:id", likeController.getLike);

export default router;
