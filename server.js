import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

mongoose.connect(process.env.DB_HOST, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => console.log("Successfully connected to database!"));


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server has started on port ${port}...`);
});