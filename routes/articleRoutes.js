import express from "express";

import * as articleController from "../controllers/articleController.js";
import commentRouter from "./commentRoutes.js";
import likeRouter from "./likeRoutes.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router();

// GET AND CREATE COMMENT
router.use("/:articleId/comments", commentRouter);

// GET AND CREATE LIKE
router.use("/:articleId/likes", likeRouter);

// GET AND CREATE ARTICLES
router
  .route("/")
  .get(protect, articleController.getAllArticles)
  .post(articleController.createArticle);

// GET HOTTEST ARTICLES
router.route("/hottest").get(articleController.getHottestArticles);

// GET MONTHLY STATS PER YEAR
router.route("/monthly-stats/:year").get(articleController.getMongthlyStats);

// GET ALL TIME STATS
router.route("/stats").get(articleController.getArticleStats);

// GET, UPDATE AND DELETE ONE ARTICLE
router
  .route("/:id")
  .get(articleController.getArticle)
  .patch(articleController.updateArticle)
  .delete(protect, restrictTo, articleController.deleteArticle);

export default router;
