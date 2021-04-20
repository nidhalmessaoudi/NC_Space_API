import AppError from "../utils/AppError.js";

// DATABASE ERRORS HANDLERS
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Duplicate field value: ${value}.Please use another value!`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data: ${errors.join(". ")}`;
    return new AppError(message, 400);
}

// AUTH ERRORS HANDLERS
const handleJWTError = () => new AppError("Invalid token. Please try again!", 401);
const handleJWTExpiredError = () => new AppError("This token has expired. Please try again!", 401);

// ERROR HANDLERS BASED ON THE APP MODE
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
}

const sendErrorProd = (err, res) => {

    // OPERATIONAL TRUSTED ERRORS? SEND TO THE CLIENT
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {

        // LOG ERROR
        console.error(`Error: ${err}`);

        // GENERIC RESPONSE FOR PROGRAMMING AND UNEXPECTED ERRORS
        res.status(500).json({
            status: "error",
            message: "Something went wrong! Try again or contact the support."
        });

    }
}

export default (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {

        sendErrorDev(err, res);

    } else if (process.env.NODE_ENV === "production") {

        let error = { ...err };

        // MONGOOSE ERRORS
        if (err.name === "CastError") error = handleCastErrorDB(err);
        if (err.code === 11000) error = handleDuplicateFieldsDB(err);
        if (err.name === "ValidationError") error = handleValidationErrorDB(err);

        // AUTH ERRORS
        if (err.name === "JsonWebTokenError") error = handleJWTError();
        if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

        sendErrorProd(error, res);

    }

}