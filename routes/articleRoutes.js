import express from "express";

import * as articleController from "../controllers/articleController.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router();

router
  .route("/")
  .get(protect, articleController.getAllArticles)
  .post(articleController.createArticle);

router.route("/hottest").get(articleController.getHottestArticles);

router.route("/monthly-stats/:year").get(articleController.getMongthlyStats);

router.route("/stats").get(articleController.getArticleStats);

router
  .route("/:id")
  .get(articleController.getArticle)
  .patch(articleController.updateArticle)
  .delete(protect, restrictTo, articleController.deleteArticle);

export default router;
