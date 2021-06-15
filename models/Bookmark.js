import mongoose from "mongoose";

import Parent from "./Parent.js";

class Bookmark extends Parent {
  constructor() {
    super();

    const bookmarkSchema = new mongoose.Schema(
      {
        article: {
          type: mongoose.Schema.ObjectId,
          ref: "Article",
          required: [true, "Bookmark must belong to an article!"],
        },
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: [true, "Bookmark must belong to a user!"],
        },
      },
      {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
      }
    );

    // AN INDEX FOR BOTH ARTICLE AND USER TO BE UNIQUE
    bookmarkSchema.index({ article: 1, user: 1 }, { unique: true });

    // POPULATE ARTICLE AND USER
    bookmarkSchema.pre(/^find/, function (next) {
      this.populate({
        path: "article",
        select: "title coverImage summary",
      }).populate({
        path: "user",
        select: "name username photo",
      });

      next();
    });

    this.model = mongoose.model("Bookmark", bookmarkSchema);
  }

  name() {
    return "bookmark";
  }
}

export default new Bookmark();
