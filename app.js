const express = require("express");

// ROUTES
const articleRouter = require("./routes/articleRoutes");

const app = express();

app.use(express.json());

app.use("/api/v1/articles", articleRouter);

module.exports = app;