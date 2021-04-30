import express from "express";

import * as authController from "../controllers/authController.js";
import * as userController from "../controllers/userController.js";

const router = express.Router();

// SIGN UP AND VERFIY
router.post("/signup", authController.signup);
router.get("/verify-email/:token", authController.verifyEmail);
router.get(
  "/send-verify-email",
  authController.protect,
  authController.sendVerifyEmail
);

// LOGIN
router.post("/login", authController.login);

// RESET PASSWORD
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);

// ME
router.get(
  "/me",
  authController.protect,
  userController.getMe,
  userController.getUser
);
router.patch("/update-me", authController.protect, userController.updateMe);
router.delete("/delete-me", authController.protect, userController.deleteMe);

// UPDATE PASSWORD
router.patch(
  "/update-password",
  authController.protect,
  authController.updatePassword
);

// FOR ADMIN
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

// GET SAVED ARTICLES FOR THE USER

export default router;
