import express from "express";

import * as authController from "../controllers/authController.js";
import * as userController from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", authController.signup);
router.get("/verify-email/:token", authController.verifyEmail);
router.get(
  "/send-verify-email",
  authController.protect,
  authController.sendVerifyEmail
);
router.post("/login", authController.login);

router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);

router.patch("/update-me", authController.protect, userController.updateMe);

router.delete("/delete-me", authController.protect, userController.deleteMe);

router.patch(
  "/update-password",
  authController.protect,
  authController.updatePassword
);

router.get("/", userController.getAllUsers);

export default router;
