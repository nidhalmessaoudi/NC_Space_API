import express from "express";

import * as articleController from "../controllers/articleController.js";

const router = express.Router();

router.route("/")
    .get(articleController.getAllArticles)
    .post(articleController.createArticle);

router.route("/:id")
    .get(articleController.getArticle)
    .patch(articleController.updateArticle)
    .delete(articleController.deleteArticle);

// router.route("/stats")
//     .get(articleController.getArticleStats);

export default router;
