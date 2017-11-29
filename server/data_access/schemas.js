"use strict";

import mongoose         from "mongoose";
import Promise          from "bluebird";

const bcrypt = Promise.promisifyAll(require("bcrypt"));

const Schema = mongoose.Schema;

const RestaurantReviewSchema = new Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
        min: 1,
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reviewedOn: {
        type: Date,
        required: true
    },
    review: {
        location: {
            type: Number,
            required: true,
            default: 0
        },
        ambiance: {
            type: Number,
            required: true,
            default: 0
        },
        foodPresentation: {
            type: Number,
            required: true,
            default: 0
        },
        foodQuality: {
            type: Number,
            required: true,
            default: 0
        },
        foodTaste: {
            type: Number,
            required: true,
            default: 0
        },
        hospitality: {
            type: Number,
            required: true,
            default: 0
        },
        costAccuracy: {
            type: Number,
            required: true,
            default: 0
        },
        overallRating: {
            type: Number,
            required: true,
            default: 0.0
        }
    }
});

RestaurantReviewSchema.index({review: String, reviewer: String});
export {RestaurantReviewSchema as RestaurantReviewSchema};

RestaurantReviewSchema.pre("save", function(next) {
    const {review} = this;

    this.review.overallRating = Math.round(
        ((review.location + review.ambiance + review.foodPresentation + review.foodQuality + review.foodTaste + review.hospitality + review.costAccuracy) / 7)
        * 10) / 10 ;

    return next();
});

export const RestaurantSchema = new Schema({
    name: String,
    address: {
        line1: {
            type: String,
            required: true,
            index: {
                unique: true
            }
        },
        line2: {
            type: String,
            index: {
                unique: true
            }
        },
        city: {
            type: String,
            required: true,
            match:/^[a-zA-Z'-]+/
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: Number,
            required: true
        }
    }
});

const UserSchema = new Schema({
    firstName: {
        type: String,
        match:/^[a-zA-Z ,.'-]+/,
        maxLength: 200
    },
    lastName: {
        type: String,
        match:/^[a-zA-Z ,.'-]+/,
        maxLength: 200
    },
    username: {
        type: String,
        index: {
            unique: true
        }
    },
    password: {
        type: String,
        required: true,
        match: /(?=.*[a-zA-Z])(?=.*[0-9]+).*/,
        minlength: 12
    },
    email: {
        type: String,
        require: true,
        match: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
    },
    created: {
        type: Date,
        required: true,
        default: new Date()
    },
    roles: {
        type: Array,
        default: ["user"]
    },
    displayName: {
        type: String,
        default: ""
    }
});

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    try {
        const hash = await bcrypt.hashAsync(this.password, 12);

        this.password = hash;
        next();

    } catch (err) {
        next(err);
    }
});

UserSchema.methods.passwordIsValid = function (password) {
    try {
        return bcrypt.compareAsync(password, this.password);
    }
    catch (err) {
        throw err;
    }
};

export {UserSchema as UserSchema};