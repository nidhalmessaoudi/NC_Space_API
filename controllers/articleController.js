const Article = require("../models/Article");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.getAllArticles = catchAsync(async (req, res) => {
    
    const articles = await Article.getAllArticles(req.query);

    res.status(200).json({
        status: "success",
        results: articles.length,
        data: {
            articles
        }
    });

});

exports.createArticle = catchAsync(async (req, res, next) => {

    const newArticle = await Article.createArticle(req.body);

    res.status(201).json({
        status: "success",
        data: {
            article: newArticle
        }
    });

});

exports.getArticle = catchAsync(async (req, res, next) => {

    const article = await Article.getArticleByID(req.params.id, req.query);

    if (!article) {
        return next(new AppError("No article found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            article
        }
    });
    
});

exports.updateArticle = catchAsync(async (req, res, next) => {

    const updatedArticle = await Article.updateArticle(req.params.id, req.body);

    if (!updatedArticle) {
        return next(new AppError("No article found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            article: updatedArticle
        }
    });

});

exports.deleteArticle = catchAsync(async (req, res, next) => {

    const deletedArticle = await Article.deleteArticle(req.params.id);

    if (!deletedArticle) {
        return next(new AppError("No article found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        data: null
    });
    
});