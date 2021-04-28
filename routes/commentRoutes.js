import express from "express";

import * as commentController from "../controllers/commentController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router
  .route("/")
  .get(protect, commentController.getAllComments)
  .post(protect, commentController.createComment);

export default router;
