import express from "express";

import AppError from "./utils/AppError.js";
import globalErrorController from "./controllers/errorController.js";
import articleRouter from "./routes/articleRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

app.use(express.json());

// ARTICLE ROUTES
app.use("/api/v1/articles", articleRouter);

// USER ROUTES
app.use("/api/v1/users", userRouter);

app.all("*",(req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorController);

export default app;