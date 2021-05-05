import express from "express";

import * as bookmarkController from "../controllers/bookmarkController.js";
import setArticleAndUserIds from "../utils/helperNestedRoutes.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route("/")
  .get(
    setArticleAndUserIds,
    restrictTo("admin"),
    bookmarkController.getAllBookmarks
  )
  .post(bookmarkController.createOrDeleteBookmark);

router.get("/:id", restrictTo("admin"), bookmarkController.getBookmark);

export default router;
