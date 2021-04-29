import Article from "../models/Article.js";
// import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import * as handlerFactory from "./handlerFactory.js";

export const getAllArticles = handlerFactory.getAll(Article);
export const getArticle = handlerFactory.getOne(Article);
export const createArticle = handlerFactory.createOne(Article);
export const updateArticle = handlerFactory.updateOne(Article);
export const deleteArticle = handlerFactory.deleteOne(Article);

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
