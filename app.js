import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import cors from "cors";
import cookieParser from "cookie-parser";

import AppError from "./utils/AppError.js";
import globalErrorController from "./controllers/errorController.js";
import articleRouter from "./routes/articleRoutes.js";
import userRouter from "./routes/userRoutes.js";
import commentRouter from "./routes/commentRoutes.js";
import likeRouter from "./routes/likeRoutes.js";
import bookmarkRouter from "./routes/bookmarkRoutes.js";
import followerRouter from "./routes/followerRoutes.js";
import adminRouter from "./routes/adminRoutes.js";

const app = express();

// GLOBAL MIDDLEWARES
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);

app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 10 * 60 * 1000,
  message: "Too many requests from this IP, please try again in 10 mins!",
});

app.use("/api", limiter);

app.use(express.json({ limit: "15kb" }));

app.use(cookieParser());

// DATA SANITIZATION AGAINT NOSQL QUERY INJECTION
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS
app.use(xss());

// PREVENT PARAMTER POLLUTION
app.use(
  hpp({
    whitelist: [
      "readingTime",
      "likes",
      "views",
      "numberOfComments",
      "paragraphs",
      "category",
    ],
  })
);

// TEST MIDDLEWARE
// app.use((req, res, next) => {
//   console.log(req.cookies);
//   next();
// });

// ARTICLE ROUTES
app.use("/api/v1/articles", articleRouter);

// USER ROUTES
app.use("/api/v1/users", userRouter);

// COMMENT ROUTES
app.use("/api/v1/comments", commentRouter);

// LIKE ROUTES
app.use("/api/v1/likes", likeRouter);

// BOOKMARK ROUTES
app.use("/api/v1/bookmarks", bookmarkRouter);

// FOLLOWER ROUTES
app.use("/api/v1/followers", followerRouter);

// ADMIN ROUTES
app.use("/api/v1/admin", adminRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorController);

export default app;
