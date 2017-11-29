"use strict";
/* eslint-disable no-console */

require("../shared/lib/extensions");
import {initialize}                 from "./initializationTasks";
let app = require("./app");
const host = "localhost";
const port = 7000;

module.exports = initialize()
    .then(function () {
       return app.listen(port, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log(`Express server listening at http://${host}:${port}`);
            }
        });
    })
    .catch(function (err) {
        console.log(err);
    });



