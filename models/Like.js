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
    likeSchema.pre(/^find/, function (next) {
      this.populate({
        path: "user",
        select: "name photo",
      });

      next();
    });

    this.#likeModel = mongoose.model("Like", likeSchema);
  }

  getAll(options) {
    return this.#likeModel.find(options);
  }

  create(like) {
    return this.#likeModel.create(like);
  }

  get(queryObj = {}) {
    return this.#likeModel.findOne(queryObj);
  }

  delete(id) {
    return this.#likeModel.findByIdAndDelete(id);
  }

  name() {
    return "like";
  }
}

export default new Like();
