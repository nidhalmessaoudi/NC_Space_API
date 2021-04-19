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