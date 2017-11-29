"use strict";
/* eslint-disable no-console */

import {
    getRestaurantModel,
    getUserModel,
    getRestaurantReviewModel
}                               from "./data_access/modelFactory";
import restaurants            from "./data/restaurants-seed";
import Promise                  from "bluebird";
import colors                   from "colors";

const fs = Promise.promisifyAll(require("fs"));
const creds = {
    "user": "modify",
    "pass": "dontgiveintothehate"
};

export const initialize = async() => {
    try {
        await seedRestaurants();
        return await seedUsersAndReviews();
    } catch (err) {
        throw err;
    }
};

const seedRestaurants = async() => {
    const restaurantModel = await getRestaurantModel(creds);
    const restaurantsExists = await restaurantModel.count({});

    try {
        if (!restaurantsExists) {
            console.log(colors.yellow("Seeding Restaurants"));
            let timelineItemModels = restaurants.map(function (i) {
                return new restaurantModel(i);
            });

            await restaurantModel.insertMany(timelineItemModels);
        }
    } catch (err) {
        throw err;
    }
};

const seedUsersAndReviews = async() => {
    const User = await getUserModel(creds);
    const RestaurantReview = await getRestaurantReviewModel(creds);
    const Restaurant = await getRestaurantModel(creds);
    const usersExists = await User.count({});
    const usersData = JSON.parse(await fs.readFileAsync("server/data/users.json", "utf-8"));

    try {
        if (usersExists)  return;

        console.log(colors.yellow("Seeding Users and Reviews"));
        let users = usersData.map(function (u) {
            return new User(u);
        });


        const min = 1;
        const maxRating = 5;
        const userDocs = await Promise.all(users.map(function (user) {
            return user.save();
        }));

        userDocs.map(async(user) => {
            const results = await Restaurant.aggregate({$sample: {size: 1}}).exec();
            const restaurant = results.pop();

            const review = getReview(min, maxRating);

            const restaurantReview = new RestaurantReview({
                restaurant: restaurant._id,
                reviewer: user._id,
                reviewedOn: getRandomDate(new Date(2000, 1, 12), new Date()),
                review
            });
            await restaurantReview.save();
        });

    } catch (err) {
        throw err;
    }
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * ((max - min + 1)) + min);
}

function getReview(min, max){
    const location = getRandomInt(min, max);
    const ambiance = getRandomInt(min, max);
    const foodPresentation = getRandomInt(min, max);
    const foodQuality = getRandomInt(min, max);
    const foodTaste = getRandomInt(min, max);
    const hospitality = getRandomInt(min, max);
    const costAccuracy = getRandomInt(min, max);


    return {
        location,
        ambiance,
        foodPresentation,
        foodQuality,
        foodTaste,
        hospitality,
        costAccuracy,
    };
}

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}