import mongoose from "mongoose";

import Parent from "./Parent.js";

class Like extends Parent {
  #likeModel;

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

    // POPULATE AUTHOR
    likeSchema.pre(/^find/, function (next) {
      this.populate({
        path: "user",
        select: "name photo",
      });

      next();
    });

    this.#likeModel = mongoose.model("Like", likeSchema);

    this.model = this.#likeModel;
  }

  name() {
    return "like";
  }
}

export default new Like();
