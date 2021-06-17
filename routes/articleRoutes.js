import express from "express";

import * as articleController from "../controllers/articleController.js";
import commentRouter from "./commentRoutes.js";
import likeRouter from "./likeRoutes.js";
import bookmarkRouter from "./bookmarkRoutes.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router();

// GET AND CREATE COMMENT
router.use("/:articleId/comments", commentRouter);

// GET AND CREATE LIKE
router.use("/:articleId/likes", likeRouter);

// GET AND CREATE BOOKMARK
router.use("/:articleId/bookmarks", bookmarkRouter);

// GET AND CREATE ARTICLES
router
  .route("/")
  .get(articleController.getAllArticles)
  .post(
    protect,
    restrictTo("admin", "writer"),
    articleController.createArticle
  );

// SEARCH ARTICLES WITH TEXT QUERIES
router.route("/search").get(articleController.getArticlesBySearch);

// GET HOTTEST ARTICLES
router.route("/hottest").get(articleController.getHottestArticles);

// GET ALL TIME STATS
router
  .route("/stats")
  .get(protect, restrictTo("admin"), articleController.getArticleStats);

// GET MONTHLY STATS PER YEAR
router
  .route("/monthly-stats/:year")
  .get(protect, restrictTo("admin"), articleController.getMongthlyStats);

// GET, UPDATE AND DELETE ONE ARTICLE BY ID
router
  .route("/:id")
  .get(articleController.getArticle)
  .patch(
    protect,
    restrictTo("admin", "writer"),
    articleController.updateArticle
  )
  .delete(protect, restrictTo("admin"), articleController.deleteArticle);

// GET ONE ARTICLE BY SLUG
router.get("/slug/:slug", articleController.getArticleBySlug);

export default router;
