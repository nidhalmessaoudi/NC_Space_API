import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

class User {

    #userModel;

    constructor () {

        const userSchema = new mongoose.Schema({
            name: {
                type: String,
                required: [true, "Please tell us your name!"]
            },
            email: {
                type: String,
                required: [true, "Please provide your email!"],
                unique: true,
                lowercase: true,
                trim: true,
                validate: [validator.isEmail, "Please provide a valid email!"]
            },
            photo: String,
            password: {
                type: String,
                required: [true, "Please provide a password"],
                minlength: [8, "Password must be equal or more than 8 characters!"],
                select: false
            },
            passwordConfirm: {
                type: String,
                required: [true, "Please confirm your password"],
                validate: {
                    validator: function (el) {
                        return el === this.password;
                    },
                    message: "Passwords are not the same!"
                }
            },
            passwordChangedAt: Date
        });

        // HASHING PASSWORDS MIDDLEWARE
        userSchema.pre("save", async function (next) {

            if (!this.isModified("password")) return next();

            this.password = await bcrypt.hash(this.password, 12);

            this.passwordConfirm = undefined;

            next();
        });

        userSchema.methods.correctPassword = function (candidatePassword, userPassword) {
            return bcrypt.compare(candidatePassword, userPassword);
        }

        userSchema.methods.isChangedAfter = function (JWTTimestamp) {

            if (this.passwordChangedAt) {

                const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

                // CHANGED MEANS TRUE && NOT CHANGED MEANS FALSE
                return JWTTimestamp < changedTimestamp;
            }

            // PASSWORD NOT CHANGED
            return false;

        }

        this.#userModel = mongoose.model("User", userSchema);

    }

    createUser (credentials) {
        return this.#userModel.create({
            name: credentials.name,
            email: credentials.email,
            password: credentials.password,
            passwordConfirm: credentials.passwordConfirm
        });
    }

    getUser (email) {
        return this.#userModel.findOne({ email }).select("+password");
    }

    getUserByID (id) {
        return this.#userModel.findById(id);
    }

}

export default new User();