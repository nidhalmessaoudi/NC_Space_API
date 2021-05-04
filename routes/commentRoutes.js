import express from "express";

import * as commentController from "../controllers/commentController.js";
import setArticleAndUserIds from "../utils/helperNestedRoutes.js";
import { protect } from "../controllers/authController.js";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(commentController.getAllComments)
  .post(protect, setArticleAndUserIds, commentController.createComment);

router.use(protect);

router
  .route("/:id")
  .get(commentController.getComment)
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

export default router;
