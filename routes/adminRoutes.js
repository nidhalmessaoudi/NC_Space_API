import express from "express";

import { protect, restrictTo } from "../controllers/authController.js";
import {
  getAllArticles,
  updateArticle,
  deleteArticle,
} from "../controllers/articleController.js";
import {
  getAllComments,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

router.use(protect, restrictTo("admin"));

// GET ALL ARTICLES AND COMMENTS
router.get("/articles", getAllArticles);
router.get("/comments", getAllComments);

// APPROVE AND DISAPPROVE ROUTES FOR ARTICLES
router.patch("/approve-article/:id", updateArticle);
router.delete("/disapprove-article/:id", deleteArticle);

// APPROVE AND DISAPPROVE ROUTES FOR COMMENTS
router.patch("/approve-comment/:id", updateComment);
router.delete("/disapprove-comment/:id", deleteComment);

export default router;
