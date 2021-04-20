import { promisify } from "util";

import jwt from "jsonwebtoken";

import User from "../models/User.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

export const signup = catchAsync(async (req, res, next) => {

    const newUser = await User.createUser(req.body);

    const token = signToken(newUser._id);

    res.status(201).json({
        status: "success",
        token,
        data: {
            user: newUser
        }
    });

});

export const login = catchAsync(async (req, res, next) => {

    const { email, password } = req.body;

    // CHECK IF EMAIL AND PASSWORD EXIST
    if (!email || !password) {

        return next(new AppError("Please provide email and password!", 400));

    } 

    // CHECK IF USER EXISTS => PASSWORD IS CORRECT ✔
    const user = await User.getUser(email);

    if (!user || !(await user.correctPassword(password, user.password))) {

        return next(new AppError("Incorrect email or password", 401));

    }

    // CHECK IF EVTHG IS OK, SEND TOKEN TO CLIENT
    const token = signToken(user._id);

    res.status(200).json({
        status: "success",
        token
    });

});

export const protect = catchAsync(async (req, res, next) => {

    // GETTING AND CHECKING IF THE TOKEN EXISTS
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(new AppError("You are not authorized to access this route. Please login first!", 401))
    }

    // TOKEN VERIFICATION
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // CHECK IF USER EXISTS
    const currentUser = await User.getUserByID(decoded.id);

    if (!currentUser) return next(new AppError("The user belonging to this token does NOT exist!", 401));

    // CHECK IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED
    if (currentUser.isChangedAfter(decoded.iat)) {
        return next(new AppError("User recently changed password! Please try again.", 401));
    }

    // IF ALL PASSED, GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});