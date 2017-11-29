"use strict";
/* eslint-disable no-console */

require("../shared/lib/extensions");
import express                      from "express";
import bodyParser                   from "body-parser";
import apiRouteConfig               from "./configurations/apiRoutesConfig";
import responseHeaderConfig         from "./configurations/responseHeaderConfig";
import sessionManagementConfig      from "./configurations/sessionsManagementConfig";
import expressValidator             from "express-validator";

const app = express();
responseHeaderConfig(app);
// sessionManagementConfig(app);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(bodyParser.json());

apiRouteConfig(app);



module.exports = app;
