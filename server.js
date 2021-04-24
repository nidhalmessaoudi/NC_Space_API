import mongoose from "mongoose";
import dotenv from "dotenv";

import rejectionHandler from "./utils/rejectionHandler.js";
import uncaughtExcHandler from "./utils/uncaughtExcHandler.js";

// HANDLE UNCAUGHT EXCEPTIONS
uncaughtExcHandler();

dotenv.config();
import app from "./app.js";

mongoose
  .connect(process.env.DB_HOST, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Successfully connected to database!"));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server has started on port ${port}...`);
});

// HANDLE UNHANDLED REJECTIONS
rejectionHandler(server);
