import mongoose from "mongoose";
import slugify from "slugify";

import Parent from "./Parent.js";

class Article extends Parent {
  constructor() {
    super();

    const articleSchema = new mongoose.Schema(
      {
        title: {
          type: String,
          required: [true, "An article must have a title!"],
          unique: [true, "This title is already used!"],
          trim: true,
          maxlength: [
            102,
            "An article title must have equal or less than 102 characters!",
          ],
          minlength: [
            12,
            "An article title must have equal or more than 12 characters!",
          ],
        },
        slug: String,
        category: {
          type: String,
          required: [true, "An article must have a category!"],
          trim: true,
        },
        summary: {
          type: String,
          trim: true,
          unique: true,
          maxlength: [
            512,
            "An article summary must have equal or less than 512 characters!",
          ],
          minlength: [
            12,
            "An article summary must have equal or more than 62 characters!",
          ],
        },
        author: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: [true, "An article must have an author!"],
        },
        readingTime: {
          type: Number,
          default: 5,
        },
        coverImage: {
          type: String,
          required: [true, "An article must have a cover image!"],
          trim: true,
        },
        paragraphs: {
          type: Number,
          required: [true, "An article must have a paragraph number!"],
          min: [1, "An article must have one or more paragraphs!"],
        },
        body: {
          type: String,
          unique: true,
          required: [true, "An article must have a body!"],
          minlength: [
            102,
            "An article body must have equal or more than 102 characters!",
          ],
        },
        tags: {
          type: String,
          default: "NC_Space tech",
        },
        numberOfLikes: {
          type: Number,
          default: 0,
        },
        numberOfComments: {
          type: Number,
          default: 0,
        },
        views: {
          type: Number,
          default: 1,
        },
        secretArticle: {
          type: Boolean,
          default: false,
        },
        approved: {
          type: Boolean,
          default: false,
        },
      },
      {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
      }
    );

    // SLUG INDEX
    articleSchema.index({ slug: 1 });

    // TEXT INDEXES FOR SEARCH
    articleSchema.index(
      {
        title: "text",
        summary: "text",
        body: "text",
        slug: "text",
      },
      { default_language: "english" }
    );

    // ADDING LIKES WITH VIRTUAL POPULATING
    articleSchema.virtual("likes", {
      ref: "Like",
      foreignField: "article",
      localField: "_id",
    });

    // ADDING COMMENTS WITH VIRTUAL POPULATING
    articleSchema.virtual("comments", {
      ref: "Comment",
      foreignField: "article",
      localField: "_id",
    });

    // POPULATE AUTHOR, LIKES AND COMMENTS
    articleSchema.pre("findOne", function (next) {
      this.populate({
        path: "author",
        select: "name photo",
      }).populate(" likes comments");
      next();
    });

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

    this.model = mongoose.model("Article", articleSchema);
  }

  getBySlug(slug) {
    return this.model.findOne({ slug });
  }

  getStats(by) {
    return this.model.aggregate([
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
    return this.model.aggregate([
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

  name() {
    return "article";
  }
}

export default new Article();
