const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");

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