import mongoose from "mongoose";

import Parent from "./Parent.js";

class Follower extends Parent {
  constructor() {
    super();

    const followerSchema = new mongoose.Schema(
      {
        followed: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: [true, "You must provide the user that gets followed!"],
          select: false,
        },
        follower: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: [true, "You must provide the follower!"],
        },
      },
      {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
      }
    );

    // AN INDEX FOR BOTH FOLLOWED AND FOLLOWER TO BE UNIQUE
    followerSchema.index({ followed: 1, follower: 1 }, { unique: true });

    // POPULATE FOLLOWER AND FOLLOWED
    followerSchema.pre(/^find/, function (next) {
      this.populate({
        path: "followed",
        select: "name photo",
      }).populate({
        path: "follower",
        select: "name photo",
      });

      next();
    });

    this.model = mongoose.model("Follower", followerSchema);
  }

  name() {
    return "follower";
  }
}

export default new Follower();
