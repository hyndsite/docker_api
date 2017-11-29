"use strict";

import helmet       from "helmet";

const responseHeaderConfig = (app) => {
    app.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'none'"],
            connectSrc: ["'self'"],
            reportUri: "/cspviolation"
        },
    }));
};

export default responseHeaderConfig;