import mongoose from "mongoose";

class Like {
  #likeModel;

  constructor() {
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
    commentSchema.pre(/^find/, function (next) {
      this.populate({
        path: "user",
        select: "name photo",
      });

      next();
    });

    this.#likeModel = mongoose.model("Like", likeSchema);
  }

  getAllLikes() {
    return this.#likeModel.find();
  }

  createLike(like) {
    return this.#likeModel.create(like);
  }
}

export default new Like();
