import express from "express";

import * as commentController from "../controllers/commentController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(protect, commentController.getAllComments)
  .post(protect, commentController.createComment);

router.route("/:id").delete(protect, commentController.deleteComment);

export default router;
