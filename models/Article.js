import mongoose from "mongoose";
import slugify from "slugify";
import Features from "./Features.js";

class Article extends Features {
  #articleModel;

  constructor() {
    super();

    const articleSchema = new mongoose.Schema(
      {
        title: {
          type: String,
          required: [true, "An article must have a title"],
          unique: true,
          trim: true,
          maxlength: [
            102,
            "An article title must have equal or less than 102 characters",
          ],
          minlength: [
            12,
            "An article title must have equal or more than 12 characters",
          ],
        },
        slug: String,
        category: {
          type: String,
          required: [true, "An article must have a category"],
          trim: true,
        },
        summary: {
          type: String,
          trim: true,
          unique: true,
          maxlength: [
            512,
            "An article summary must have equal or less than 512 characters",
          ],
          minlength: [
            102,
            "An article summary must have equal or more than 102 characters",
          ],
        },
        author: {
          type: String,
          required: [true, "An article must have an author"],
          trim: true,
          maxlength: [
            32,
            "An article author must have equal or less than 512 characters",
          ],
          minlength: [
            4,
            "An article author must have equal or more than 102 characters",
          ],
        },
        readingTime: {
          type: Number,
          default: 5,
        },
        coverImage: {
          type: String,
          required: [true, "An article must have a cover image"],
          trim: true,
        },
        paragraphs: {
          type: Number,
          required: [true, "An article must have a paragraph number"],
          min: [1, "An article must have one or more paragraphs"],
        },
        contentMarkup: {
          type: String,
          unique: true,
          required: [true, "An article must have a content markup"],
          minlength: [
            102,
            "An article markup must have equal or more than 102 characters",
          ],
        },
        tags: {
          type: String,
          default: "NC_Space tech",
        },
        likes: {
          type: Number,
          default: 0,
        },
        numberOfComments: {
          type: Number,
          default: 0,
        },
        comments: [String],
        views: {
          type: Number,
          default: 0,
        },
        secretArticle: {
          type: Boolean,
          default: false,
        },
      },
      { timestamps: true }
    );

    // CREATE SLUG MIDDLEWARE
    articleSchema.pre("save", function (next) {
      this.slug = slugify(this.title, { lower: true });
      next();
    });

    // EXCLUDE SECRET ARTICLES MIDDLEWARE
    articleSchema.pre(/^find/, function (next) {
      this.find({ secretArticle: { $ne: true } });
      next();
    });

    this.#articleModel = mongoose.model("Article", articleSchema);
  }

  createArticle(article) {
    return this.#articleModel.create(article);
  }

  getAllArticles(queryObj = {}) {
    this.filter(this.#articleModel, queryObj);
    this.sort(queryObj);
    this.limitFields(this.query, queryObj);
    this.paginate(queryObj);

    return this.query;
  }

  getArticleByID(id, queryObj = {}) {
    this.limitFields(this.#articleModel.findById(id), queryObj);

    return this.query;
  }

  updateArticle(id, newContent) {
    return this.#articleModel.findByIdAndUpdate(id, newContent, {
      new: true,
      runValidators: true,
    });
  }

  deleteArticle(id) {
    return this.#articleModel.findByIdAndDelete(id);
  }

  getStats(by) {
    return this.#articleModel.aggregate([
      {
        $group: {
          _id: `$${by}` || null,
          totalArticles: { $sum: 1 },
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: "$likes" },
          totalComments: { $sum: "$numberOfComments" },
          paragraphs: { $sum: "$paragraphs" },
          avgParagraphs: { $avg: "$paragraphs" },
          avgReadingTime: { $avg: "$readingTime" },
        },
      },
    ]);
  }

  getMonthlyStats(year) {
    return this.#articleModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          numArticles: { $sum: 1 },
          paragraphs: { $sum: "$paragraphs" },
          avgParagraphs: { $avg: "$paragraphs" },
          avgReadingTime: { $avg: "$readingTime" },
          views: { $sum: "$views" },
          likes: { $sum: "$likes" },
          comments: { $sum: "$comments" },
          articles: { $push: "$title" },
        },
      },
      {
        $addFields: {
          month: "$_id",
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          numArticles: -1,
        },
      },
      {
        $limit: 12,
      },
    ]);
  }
}

export default new Article();
