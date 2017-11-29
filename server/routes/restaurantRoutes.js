"use strict";

/* eslint-disable no-console */

import React                         from "react";
import {Router}                      from "express";
import {
    getRestaurantModelQuery,
    getRestaurantModelModify}        from "../data_access/modelFactory";

const restaurantRouter = Router();

restaurantRouter.route("/api/restaurants")
    .get(getRestaurants)
    .post(addRestaurant);

async function addRestaurant(req, res) {
    try {
        const Restaurant = await getRestaurantModelModify();
        const restaurantInfo = req.body;

        if (!restaurantInfo) {
            return res.status(400).send("Restaurant information is missing.  Please correct and resubmit.");
        }

        const restaurant = new Restaurant(restaurantInfo);

        await restaurant.save()
            .then(restaurant => {
                return res.status(201).send({
                    name: restaurant.name,
                    id: restaurant._id,
                    address: restaurant.address
                });
            })
            .catch(err => {
                return res.status(400).send(err);
            });

        return res.send(restaurantInfo);
    }
    catch (err) {
        console.log(err);
       return res.status(500).send("There was error saving the restaurant information, please try again.");
    }
}

async function getRestaurants(req, res) {
    try {
        const {city} = req.query;
        const query = { };

        const regex = new RegExp(/^[a-bA-Z0-9]+$/, "gi");
        if (city && regex.test(city)) {
            query["address.city"] = {$regex: `${city}`, $options: "i"};
        }

        const restaurantModel = await getRestaurantModelQuery();
        const restaurants = await restaurantModel.find(query).select("-__v").exec();

        res.json({
            restaurants: restaurants.map(restaurant => {
                return {
                    id: restaurant._id,
                    name: restaurant.name,
                    address: restaurant.address
                };
            })
        });
    } catch (error) {
        console.log(error);
       return res.status(500).send("There was an error retrieving restaurants.  Please try again later");
    }
}
export default restaurantRouter;

