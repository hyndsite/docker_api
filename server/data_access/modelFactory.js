"use strict";

import {
    RestaurantSchema,
    UserSchema,
    RestaurantReviewSchema }                                     from "./schemas";
import connectionProvider                                        from "./connectionProvider";
import {serverSettings}                                          from "../settings";

export async function getUserModelQuery() {
    return getUserModel(serverSettings.users.query);
}

export async function getUserModelModify() {
    return getUserModel(serverSettings.users.modify);
}

export async function getRestaurantModelQuery() {
    return getRestaurantModel(serverSettings.users.query)
}

export async function getRestaurantModelModify() {
    return getRestaurantModel(serverSettings.users.modify);
}

export async function getRestaurantReviewsModelQuery() {
    return getRestaurantReviewModel(serverSettings.users.query);
}

export async function getRestaurantReviewModelModify() {
    return getRestaurantReviewModel(serverSettings.users.modify);
}

export const getUserModel = async function (opts) {
    try {
        const conn = await connectionProvider(serverSettings.serverUrl, serverSettings.database, opts);
        return conn.model("User", UserSchema);
    } catch (err) {
        throw err;
    }
};

export const getRestaurantModel = async function (opts) {
    try {
        const conn = await connectionProvider(serverSettings.serverUrl, serverSettings.database, opts);
        return conn.model("Restaurant", RestaurantSchema);
    } catch (err) {
        throw err;
    }
};

export const getRestaurantReviewModel = async function(opts) {
    try {
        const conn = await connectionProvider(serverSettings.serverUrl, serverSettings.database, opts);
        return conn.model("RestaurantReview", RestaurantReviewSchema);
    } catch(err) {
        throw err;
    }
};
