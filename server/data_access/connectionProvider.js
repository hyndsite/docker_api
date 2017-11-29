"use strict";
/* eslint-disable no-console */

import mongoose         from "mongoose";
import Promise          from "bluebird";

mongoose.Promise = Promise;
const _internalConnectionPool = {};

export default function (url, database, options) {
    const opts = Object.assign({}, {
        server: {poolSize: 5}
    }, options);

    return new Promise(function(resolve, reject){
        const address = `mongodb://${opts.user}:${opts.pass}@${url}/${database}?authSource=${database}`;
        const connection = `${opts.user}_${address}`;

        if (!(_internalConnectionPool[connection])) {
            try {
                const conn = mongoose.createConnection(address, opts);
                conn.on("open", function () {
                    _internalConnectionPool[connection] = conn;
                    resolve(_internalConnectionPool[connection]);
                });

                conn.on("error", function(err) { console.error("MongoDB error: %s", err); });
            } catch (err) {
                reject(err);
            }
        } else {
            return resolve( _internalConnectionPool[connection]);
        }
    });
}
