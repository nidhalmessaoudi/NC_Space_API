import Article from "../models/Article.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import * as handlerFactory from "./handlerFactory.js";

export const getAllArticles = handlerFactory.getAll(Article);
export const getArticle = handlerFactory.getOne(Article);
export const createArticle = handlerFactory.createOne(Article);
export const updateArticle = handlerFactory.updateOne(Article);
export const deleteArticle = handlerFactory.deleteOne(Article);

export const getArticleBySlug = catchAsync(async (req, res, next) => {
  if (!req.params.slug)
    return next(new AppError("Please provide a valid slug!"));

  const article = await Article.getBySlug(req.params.slug);

  if (!article)
    return next(new AppError("No article was found with this slug!", 400));

  res.status(200).json({
    status: "success",
    data: {
      article,
    },
  });
});

export const getArticlesBySearch = catchAsync(async (req, res, next) => {
  if (!req.query.q)
    return next(new AppError("Please provide a query for your search!", 400));

  const query = req.query.q.split("-").join(" ");

  // { $text: { $search: query } };
  const articles = await Article.getAll({
    text: { search: query },
    approved: { ne: false },
  });

  res.status(200).json({
    status: "success",
    results: articles.length,
    data: {
      articles,
    },
  });
});

export const getHottestArticles = catchAsync(async (req, res, next) => {
  const hottestArticles = await Article.getAll({
    sort: "-views",
    limit: 4,
    fields:
      "slug,title,likes,comments,views,category,summary,coverImage,createdAt",
  });

  res.status(200).json({
    status: "success",
    results: hottestArticles.length,
    data: {
      hottestArticles,
    },
  });
});

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
