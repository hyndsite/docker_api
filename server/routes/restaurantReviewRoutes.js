"use strict";

import {Router}                     from "express";
import cors                         from "cors";
import {
    getRestaurantModelModify,
    getRestaurantModelQuery,
    getRestaurantReviewModelModify,
    getRestaurantReviewsModelQuery,
    getUserModelQuery
}                                   from "../data_access/modelFactory";
import mongoose                     from "mongoose";
const reviewsRouter = Router();


reviewsRouter.route("/api/reviews")
    .get(getAllReviews);

reviewsRouter.route("/api/restaurants/:restaurantId/reviews")
    .all(function(req, res, next) {
        try {
            const {restaurantId} = req.params;
            const validRestaruantId = new RegExp(/^[a-bA-Z0-9]+$/, "gi");

            if (!restaurantId || !validRestaruantId.test(restaurantId)) {
                return res.status(400).send("Please provide a valid restaurant ID.");
            }
            next();
        }
        catch(err) {
            res.status(500).send("There was an error with the provided restaurant ID.");
        }
    })
    .get(cors(), getRestaurantReviewsByRestaurantId)
    .post(cors(), addRestaurantReview)
    .delete(cors(), removeRestaurantReview);

reviewsRouter.route("/api/restaurants/:restaurantId/reviews/:reviewId")
    .all(function(req, res, next) {
        try {
            const {restaurantId} = req.params;
            const validId = new RegExp(/^[a-bA-Z0-9]+$/, "gi");

            if (!restaurantId || !validId.test(restaurantId)) {
                return res.status(400).send("Please provide a valid restaurant ID.");
            }

            next();
        }
        catch(err) {
            res.status(500).send("There was an error with the provided restaurant ID.");
        }
    })
    .delete(cors(), removeRestaurantReview);

async function getAllReviews(req, res) {
    try {
        const Review = await getRestaurantReviewsModelQuery();
        const User = await getUserModelQuery();

        const {reviewer} = req.query;
        const query = {};

        const emailValidation = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/, "gi");
        if (reviewer && emailValidation.test(reviewer)) {
            const user = await User.findOne({email: reviewer});

            if (user) {
                query["reviewer"] = mongoose.Types.ObjectId(user._id);
            }
        }

        const reviews = await Review.find(query).select("-__v")
            .populate({path: "reviewer", select: "firstName lastName email"})
            .populate({path: "restaurant", select: "name address"});


        return res.json(reviews);
    }
    catch(err) {
        res.status(500).send("There was an error retrieving reviews for the specified user.");
    }
}

async function removeRestaurantReview(req, res) {
    try {
        const Restaurant = await getRestaurantModelQuery();
        const Review = await getRestaurantReviewModelModify();

        const {restaurantId, reviewId} = req.params;

        const reviewedRestaurant = await Restaurant.find({_id: restaurantId});
        if (!reviewedRestaurant) {
            return res.status(404).send("The specified restaurant does not exist.");
        }

        const review = await Review.find({_id: reviewId});
        if (!review) {
            return res.status(404).send("The specified review does not exist.");
        }

        await Review.remove({_id: reviewId});
        res.status(204).send("Review removed");
    }
    catch(err) {
        return res.status(500).send("There was an issue attempting to remove the review. Please try again later.");
    }
}

async function addRestaurantReview(req, res) {
    try {

        const Restaurant = await getRestaurantModelQuery();
        const Review = await getRestaurantReviewModelModify();
        const User = await getUserModelQuery();

        const {restaurantId} = req.params;
        const {reviewer, review} = req.body;

        const userValidation = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/, "gi");

        if(!reviewer || !userValidation.test(reviewer)) {
            return res.status(400).send("Please provide a user to associate this review with");
        }

        const user = await User.findOne({email: reviewer}).exec();
        if (!reviewer) {
            return res.status(400).send("The specified user does not exist.");
        }

        const reviewedRestaurant = await Restaurant.find({_id: restaurantId});
        if (!reviewedRestaurant) {
            return res.status(404).send("The specified restaurant does not exist.");
        }

        const submission = new Review({
            reviewedOn: new Date(),
            restaurant: restaurantId,
            reviewer: user._id,
            review
        });


        await submission.save();
        return res.status(201).send("Review created");
    }
    catch(err) {
        res.status(500).send("There was a problem trying to save the review. Please try again later.");
    }
}

async function getRestaurantReviewsByRestaurantId(req, res) {
    try {
        const {restaurantId} = req.params;
        const Restaurant = await getRestaurantModelQuery();
        const RestaurantReview = await getRestaurantReviewsModelQuery();
        const User = await getUserModelQuery();


        const reviews = await RestaurantReview.aggregate(
            [
                {$match: {restaurant: mongoose.Types.ObjectId(restaurantId)}},
            ]
        ).exec();

        await Restaurant.populate(reviews, {path: "restaurant", select: "name"}, function (err, rv) {
            return rv;
        });

        await User.populate(reviews, {path: "reviewer", select: "firstName lastName"}, function (err, rv) {
            return rv;
        });

        const data = reviews.map(rv => {
            const {reviewer, restaurant, review} = rv;
            return {
                id: rv._id,
                restaurant: restaurant.name,
                review,
                reviewer: `${reviewer.firstName} ${reviewer.lastName}`
            };
        });

        return res.json(data);

    } catch (err) {
        res.status(500).send("There was a problem getting the restaurant reviews for the specified restaurant.  Please try again later.");
    }
}

export default reviewsRouter;