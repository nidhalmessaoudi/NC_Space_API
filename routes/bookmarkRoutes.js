import express from "express";

import * as bookmarkController from "../controllers/bookmarkController.js";
import setArticleAndUserIds from "../utils/helperNestedRoutes.js";
import { protect } from "../controllers/authController.js";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(protect, setArticleAndUserIds, bookmarkController.getAllBookmarks)
  .post(protect, bookmarkController.createOrDeleteBookmark);

router.get("/:id", bookmarkController.getBookmark);

export default router;
