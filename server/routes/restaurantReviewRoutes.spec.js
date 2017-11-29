require("babel-polyfill");
process.env.NODE_ENV = "test";

let getRestaurantModel = require("../data_access/modelFactory").getRestaurantModel;
let getRestaurantReviewModel = require("../data_access/modelFactory").getRestaurantReviewModel;

import {describe, it, before, beforeEach}           from "mocha";
import {expect, assert, should} from "chai";

let request = require("supertest");
let app = require("../app");
let Restaurant;
let RestaurantReview;
let restaurant;

describe("Restaurants",  () => {

    before((done) => {
        getRestaurantModel()
            .then(model => {
                Restaurant = model;
            });

        getRestaurantReviewModel()
            .then(model => {
                RestaurantReview = model;
                done();
            });
    });

    beforeEach((done) => {
        Restaurant.aggregate({$sample: {size: 1}})
            .exec()
            .then(results => {
                restaurant = results.pop();
                done();
            });
    });
    /*
     * Test the /GET restaurant review route
     */
    describe("/GET restaurant reviews by restaurant", () => {
        it("it should GET all the reviews", () => {
            return request(app)
                .get(`/api/restaurants/${restaurant._id}/reviews`)
                .then(response => {
                    expect(response.statusCode).to.eq(200);
                    expect(response.body.length).to.be.above(0);
                });
        });
    });
});