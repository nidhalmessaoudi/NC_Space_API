import express from "express";

import * as articleController from "../controllers/articleController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.route("/")
    .get(protect, articleController.getAllArticles)
    .post(articleController.createArticle);

router.route("/stats")
    .get(articleController.getArticleStats);

router.route("/:id")
    .get(articleController.getArticle)
    .patch(articleController.updateArticle)
    .delete(articleController.deleteArticle);

export default router;
