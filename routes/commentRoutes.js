import express from "express";

import * as commentController from "../controllers/commentController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(protect, commentController.getAllComments)
  .post(
    protect,
    commentController.setArticleAndUserIds,
    commentController.createComment
  );

router
  .route("/:id")
  .get(commentController.getComment)
  .patch(protect, commentController.updateComment)
  .delete(protect, commentController.deleteComment);

export default router;
