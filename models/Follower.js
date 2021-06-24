import mongoose from "mongoose";

import Parent from "./Parent.js";
import User from "./User.js";

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
        select: "name username photo",
      }).populate({
        path: "follower",
        select: "name username photo",
      });

      next();
    });

    followerSchema.statics.calcFollowersAndFollowings = async function (
      followerId,
      followedId
    ) {
      const followersStats = await this.aggregate([
        {
          $match: { follower: followerId },
        },
        {
          $group: {
            _id: "$follower",
            nFollowings: { $sum: 1 },
          },
        },
      ]);

      const followingsStats = await this.aggregate([
        {
          $match: { followed: followedId },
        },
        {
          $group: {
            _id: "$followed",
            nFollowers: { $sum: 1 },
          },
        },
      ]);

      await User.update(followerId, {
        numberOfFollowings: followersStats[0]?.nFollowings || 0,
      });

      await User.update(followedId, {
        numberOfFollowers: followingsStats[0]?.nFollowers || 0,
      });
    };

    followerSchema.post("save", async function () {
      this.constructor.calcFollowersAndFollowings(this.follower, this.followed);
    });

    followerSchema.pre(/^findOneAnd/, async function (next) {
      this.follower = await this.findOne();
      next();
    });

    followerSchema.post(/^findOneAnd/, async function () {
      this.follower.constructor.calcFollowersAndFollowings(
        this.follower,
        this.followed
      );
    });

    this.model = mongoose.model("Follower", followerSchema);
  }

  name() {
    return "follower";
  }
}

export default new Follower();
