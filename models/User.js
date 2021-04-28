import crypto from "crypto";

import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

import encrypt from "../utils/encrypt.js";

class User {
  #userModel;

  constructor() {
    const userSchema = new mongoose.Schema({
      name: {
        type: String,
        required: [true, "Please tell us your name!"],
      },
      email: {
        type: String,
        required: [true, "Please provide your email!"],
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, "Please provide a valid email!"],
      },
      photo: String,
      role: {
        type: String,
        enum: ["user", "writer", "admin"],
        default: "user",
      },
      password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: [8, "Password must be equal or more than 8 characters!"],
        select: false,
      },
      passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
          validator: function (el) {
            return el === this.password;
          },
          message: "Passwords are not the same!",
        },
      },
      verified: {
        type: Boolean,
        default: false,
      },
      verifyToken: String,
      verifyTokenExpires: Date,
      passwordChangedAt: Date,
      resetToken: String,
      resetTokenExpires: Date,
      active: {
        type: Boolean,
        default: true,
        select: false,
      },
    });

    // HASHING PASSWORDS MIDDLEWARE
    userSchema.pre("save", async function (next) {
      if (!this.isModified("password")) return next();

      this.password = await bcrypt.hash(this.password, 12);

      this.passwordConfirm = undefined;

      next();
    });

    userSchema.pre("save", function (next) {
      if (!this.isModified("password") || this.isNew) return next();

      this.passwordChangedAt = Date.now() - 1000;

      next();
    });

    userSchema.pre(/^find/, function (next) {
      this.find({ active: { $ne: false } });

      next();
    });

    userSchema.methods.correctPassword = function (
      candidatePassword,
      userPassword
    ) {
      return bcrypt.compare(candidatePassword, userPassword);
    };

    userSchema.methods.isChangedAfter = function (JWTTimestamp) {
      if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
          this.passwordChangedAt.getTime() / 1000,
          10
        );

        // CHANGED MEANS TRUE && NOT CHANGED MEANS FALSE
        return JWTTimestamp < changedTimestamp;
      }

      // PASSWORD NOT CHANGED
      return false;
    };

    userSchema.methods.createToken = function (expiresTime) {
      if (expiresTime < 10) {
        const verifyToken = crypto.randomBytes(32).toString("hex");

        this.verifyToken = encrypt(verifyToken);

        this.verifyTokenExpires = Date.now() + expiresTime * 60 * 1000;

        return verifyToken;
      } else {
        const resetToken = crypto.randomBytes(32).toString("hex");

        this.resetToken = encrypt(resetToken);

        this.resetTokenExpires = Date.now() + expiresTime * 60 * 1000;

        return resetToken;
      }
    };

    this.#userModel = mongoose.model("User", userSchema);
  }

  getAll(queryObj = {}) {
    return this.#userModel.find(queryObj);
  }

  create(credentials) {
    return this.#userModel.create({
      name: credentials.name,
      email: credentials.email,
      photo: credentials.photo,
      role: credentials.role,
      password: credentials.password,
      passwordConfirm: credentials.passwordConfirm,
    });
  }

  save(user, options = {}) {
    return user.save(options);
  }

  get(query) {
    return this.#userModel.findOne(query);
  }

  getByEmail(email) {
    return this.#userModel.findOne({ email }).select("+password");
  }

  getById(id, options = {}) {
    return this.#userModel.findById(id).select(options);
  }

  update(id, data, options = {}) {
    return this.#userModel.findByIdAndUpdate(id, data, options);
  }

  delete(id) {
    return this.#userModel.findByIdAndDelete(id);
  }

  name() {
    return "user";
  }
}

export default new User();
