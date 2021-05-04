import express from "express";

import { protect, restrictTo } from "../controllers/authController.js";
import {
  updateArticle,
  deleteArticle,
} from "../controllers/articleController.js";
import {
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

router.use(protect, restrictTo("admin"));

// APPROVE AND DISAPPROVE ROUTES FOR ARTICLES
router.patch("/approve-article/:id", updateArticle);
router.delete("/disapprove-article/:id", deleteArticle);

// APPROVE AND DISAPPROVE ROUTES FOR COMMENTS
router.patch("/approve-comment/:id", updateComment);
router.delete("/disapprove-comment/:id", deleteComment);

export default router;
