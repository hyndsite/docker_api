require("babel-polyfill");
process.env.NODE_ENV = "test";

let getRestaurantModel = require("../data_access/modelFactory").getRestaurantModel;

import {describe, it}           from "mocha";
import {expect, assert, should} from "chai";

let request = require("supertest");
let app = require("../app");
let Restaurant;

describe("Restaurants",  () => {

    before((done) => {
        getRestaurantModel()
            .then(model => {
                Restaurant = model;
                done();
            });
    });

    /*
     * Test the /GET route
     */
    describe("/GET restaurants", () => {
        it("it should GET all the restaurants", () => {
            return request(app)
                .get("/api/restaurants")
                .then(response => {
                    expect(response.statusCode).to.eq(200);
                    expect(response.body).to.be.a("object");
                    expect(response.body.restaurants.length).to.exist;
                });
        });
    });

    describe("/GET restaurants?city=x", () => {
        it("it should GET all the restaurants that are in the specified city", () => {
            return request(app)
                .get("/api/restaurants?city=denver")
                .then(response => {
                    expect(response.statusCode).to.eq(200);
                    expect(response.body).to.be.a("object");
                    expect(response.body.restaurants.length).to.be.above(0);
                });
        });
    });

    describe("/POST restaurants", () => {
        const newRestaurant = {
            name: "Test Restaurant",
            address: {
                line1: "147 abc lane",
                line2: "some misc here",
                city: "Los Angeles",
                state: "California",
                zipCode: "90745"
            }
        };

        afterEach((done) => {
            Restaurant.remove({_id: newRestaurant._id}, () => {
                done();
            });
        });

        it("it should POST a new restaurant with all relevant information", () => {
            return request(app)
                .post("/api/restaurants")
                .send(newRestaurant)
                .set("Accept", /application\/json/)
                .then(response => {
                    newRestaurant._id = response.body.id;
                    expect(response.statusCode).to.eq(201);
                });
        });
    });
});