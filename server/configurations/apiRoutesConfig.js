"use strict";

import timelineRouter               from "../routes/restaurantRoutes";
import authenticationRouter         from "../routes/authenticationRoutes";
import eventVoteRoutes              from "../routes/restaurantReviewRoutes";
import adminRouter                  from "../routes/adminRoutes";
import cors                         from "cors";

export default function ConfigApiRoutes(app) {
    app.use(cors());
    app.use(timelineRouter);
    app.use(authenticationRouter);
    app.use(eventVoteRoutes);
    app.use(adminRouter);
}