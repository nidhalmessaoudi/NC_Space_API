import Article from "../models/Article.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import * as handlerFactory from "./handlerFactory.js";

export const getAllArticles = catchAsync(async (req, res, next) => {
  const articles = await Article.getAll(req.query);

  res.status(200).json({
    status: "success",
    results: articles.length,
    data: {
      articles,
    },
  });
});

export const createArticle = catchAsync(async (req, res, next) => {
  const newArticle = await Article.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      article: newArticle,
    },
  });
});

export const getArticle = catchAsync(async (req, res, next) => {
  const article = await Article.get(req.params.id, req.query, "comments likes");

  // UPDATE ARTICLE VIEWS
  if (article.views) {
    article.views++;
    await Article.save(article);
  }

  if (!article) {
    return next(new AppError("No article found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      article,
    },
  });
});

export const getHottestArticles = catchAsync(async (req, res, next) => {
  const hottestArticles = await Article.getAll({
    sort: "-views",
    limit: 4,
    fields: "title,likes,comments,views,category,summary,coverImage,createdAt",
  });

  res.status(200).json({
    status: "success",
    results: hottestArticles.length,
    data: {
      hottestArticles,
    },
  });
});

export const updateArticle = catchAsync(async (req, res, next) => {
  const updatedArticle = await Article.update(req.params.id, req.body);

  if (!updatedArticle) {
    return next(new AppError("No article found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      article: updatedArticle,
    },
  });
});

export const deleteArticle = handlerFactory.deleteOne(Article);

export const getArticleStats = catchAsync(async (req, res, next) => {
  const articleStats = await Article.getStats(req.query?.by);

  res.status(200).json({
    status: "success",
    data: {
      stats: articleStats,
    },
  });
});

export const getMongthlyStats = catchAsync(async (req, res, next) => {
  const year = req.params.year;

  const monthlyStats = await Article.getMonthlyStats(year);

  res.status(200).json({
    status: "success",
    data: {
      stats: monthlyStats,
    },
  });
});
