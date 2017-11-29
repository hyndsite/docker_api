"use strict";

export const serverSettings = {
    serverUrl: "mongo:27017",
    database: "restaurantreviewsDb",
    users: {
        modify: {
            "user": "modify",
            "pass": "dontgiveintothehate"
        },
        query: {
            "user": "query",
            "pass": "youcannotescapeyourdestiny"
        }
    }
};