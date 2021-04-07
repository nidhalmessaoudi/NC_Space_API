const Article = require("../models/articleModel");

exports.getAllArticles = async (req, res) => {
    try {
        const category = req.query?.category;

        const articles = category ?
         await Article.getArticlesByCategory(category) : await Article.getAllArticles();

        res.status(200).json({
            status: "success",
            results: articles.length,
            data: {
                articles
            }
        });
    } catch (err) {
        res.status(404).json({
            status: "fail",
            Message: err
        });
    }
};

exports.createArticle = async (req, res) => {
    try {
        const newArticle = await Article.createArticle(req.body);

        res.status(201).json({
            status: "success",
            data: {
                article: newArticle
            }
        });
    } catch (err) {
        res.status(404).json({
            status: "fail",
            Message: err
        });
    }
};

exports.getArticle = async (req, res) => {
    try {
        const article = await Article.getArticleByID(req.params.id);

        res.status(200).json({
            status: "success",
            data: {
                article
            }
        });
    } catch {
        res.status(404).json({
            status: "fail",
            Message: err
        });
    }
}

exports.updateArticle = async (req, res) => {
    try {

        const updatedArticle = await Article.updateArticle(req.params.id, req.body);
        res.status(200).json({
            status: "success",
            data: {
                article: updatedArticle
            }
        });

    } catch {
        res.status(404).json({
            status: "fail",
            Message: err
        });
    }
};

exports.deleteArticle = async (req, res) => {
    try {
        await Article.deleteArticle(req.params.id);
        res.status(204).json({
            status: "success",
            data: null
        });
    } catch (err) {
        res.status(404).json({
            status: "fail",
            Message: err
        });
    }
};