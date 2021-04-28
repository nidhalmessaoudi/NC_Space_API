import mongoose from "mongoose";

class Comment {
  #commentModel;

  constructor() {
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

    this.#commentModel = mongoose.model("Comment", commentSchema);
  }

  getAllComments(options = {}) {
    return this.#commentModel.find(options);
  }

  createComment(comment) {
    return this.#commentModel.create(comment);
  }
}

export default new Comment();
