const express = require("express");

const AppError = require("./utils/AppError");
const globalErrorController = require("./controllers/errorController");
const articleRouter = require("./routes/articleRoutes");

const app = express();

app.use(express.json());

// ROUTES
app.use("/api/v1/articles", articleRouter);

app.all("*",(req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorController);

module.exports = app;