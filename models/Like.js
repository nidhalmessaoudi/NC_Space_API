import mongoose from "mongoose";

import Parent from "./Parent.js";
import Article from "./Article.js";

class Like extends Parent {
  constructor() {
    super();

    const likeSchema = new mongoose.Schema(
      {
        article: {
          type: mongoose.Schema.ObjectId,
          ref: "Article",
          required: [true, "Like must belong to an article!"],
        },
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: [true, "Like must belong to a user!"],
        },
      },
      {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
      }
    );

    // AN INDEX FOR BOTH ARTICLE AND USER TO BE UNIQUE
    likeSchema.index({ article: 1, user: 1 }, { unique: true });

    // POPULATE AUTHOR
    likeSchema.pre(/^find/, function (next) {
      this.populate({
        path: "user",
        select: "name photo",
      });

      next();
    });

    likeSchema.statics.calcLikes = async function (articleId) {
      const stats = await this.aggregate([
        {
          $match: { article: articleId },
        },
        {
          $group: {
            _id: "$article",
            nLikes: { $sum: 1 },
          },
        },
      ]);

      await Article.update(articleId, {
        numberOfLikes: stats[0]?.nLikes || 0,
      });
    };

    likeSchema.post("save", async function () {
      this.constructor.calcLikes(this.article);
    });

    likeSchema.pre(/^findOneAnd/, async function (next) {
      this.like = await this.findOne();
      next();
    });

    likeSchema.post(/^findOneAnd/, async function () {
      await this.like.constructor.calcLikes(this.like.article);
    });

    this.model = mongoose.model("Like", likeSchema);
  }

  name() {
    return "like";
  }
}

export default new Like();
