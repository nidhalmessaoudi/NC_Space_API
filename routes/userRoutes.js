import express from "express";

import * as authController from "../controllers/authController.js";
import * as userController from "../controllers/userController.js";
import * as oauthController from "../controllers/oauthController.js";

const router = express.Router();

// SIGN UP AND VERFIY
router.post("/signup", authController.signup);
router.get("/verify-email/:token", authController.verifyEmail);

// LOGIN
router.post("/login", authController.login);

// RESET PASSWORD
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);

// LOGIN/SIGN UP WITH GOOGLE OAUTH2
router.get("/google-login", oauthController.getGoogleLogin);
router.get("/auth/google", oauthController.getGoogleRedirect);

// PROTECT ALL ROUTES AFTER THIS MIDDLEWARE
router.use(authController.protect);

// SEND EMAIL VERIFICATION
router.get("/send-verify-email", authController.sendVerifyEmail);

// ME
router.get("/me", userController.getMe, userController.getUser);
router.patch("/update-me", userController.updateMe);
router.delete("/delete-me", userController.deleteMe);

// UPDATE PASSWORD
router.patch("/update-password", authController.updatePassword);

// RESTRICT TO ONLY ADMIN FOR ALL ROUTES AFTER THIS MIDDLEWARE
router.use(authController.restrictTo("admin"));

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

export default router;
