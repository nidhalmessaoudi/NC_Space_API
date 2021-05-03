import express from "express";

import * as bookmarkController from "../controllers/bookmarkController.js";
import setArticleAndUserIds from "../utils/helperNestedRoutes.js";
import { protect } from "../controllers/authController.js";

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route("/")
  .get(setArticleAndUserIds, bookmarkController.getAllBookmarks)
  .post(bookmarkController.createOrDeleteBookmark);

router.get("/:id", bookmarkController.getBookmark);

export default router;
