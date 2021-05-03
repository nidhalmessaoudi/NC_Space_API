import mongoose from "mongoose";

import Parent from "./Parent.js";
import Article from "./Article.js";

class Comment extends Parent {
  constructor() {
    super();

    const commentSchema = new mongoose.Schema(
      {
        comment: {
          type: String,
          required: [true, "Comment cannot be empty!"],
        },
        likes: Number,
        dislikes: Number,
        article: {
          type: mongoose.Schema.ObjectId,
          ref: "Article",
          required: [true, "Comment must belong to an article!"],
        },
        author: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: [true, "Comment must belong to an author!"],
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

    // POPULATE AUTHOR
    commentSchema.pre(/^find/, function (next) {
      this.populate({
        path: "author",
        select: "name photo",
      });

      next();
    });

    commentSchema.statics.calcComments = async function (articleId) {
      const stats = await this.aggregate([
        {
          $match: { article: articleId },
        },
        {
          $group: {
            _id: "$article",
            nComments: { $sum: 1 },
          },
        },
      ]);

      await Article.update(articleId, {
        numberOfComments: stats[0]?.nComments || 0,
      });
    };

    commentSchema.post("save", async function () {
      this.constructor.calcComments(this.article);
    });

    commentSchema.pre(/^findOneAnd/, async function (next) {
      this.comment = await this.findOne();
      next();
    });

    commentSchema.post(/^findOneAnd/, async function () {
      await this.comment.constructor.calcComments(this.comment.article);
    });

    this.model = mongoose.model("Comment", commentSchema);
  }

  name() {
    return "comment";
  }
}

export default new Comment();
