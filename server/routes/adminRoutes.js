"use strict";

import {Router}                                 from "express";
import { getUserModel }                         from "../data_access/modelFactory";
import RBAC                                     from "../data_access/rbac";

const adminRouter = Router();
const rbac = new RBAC();
adminRouter.route("/api/admin/users")
    .all(async (req, res, next) => {
        try {
           const user = await acquireUser(req);
            rbac.check(user).is("admin").can("list users", function (err, results) {
                if (!results){
                    return res.sendStatus(401);
                }
                next();
            });

        } catch (err) {
            return res.sendStatus(401);
        }
    })
    .get(async function (req, res) {
        try {
            const pageSize = 50;
            const {page} = req.query;
            const skip = page > 1 ? page * 50 : 0;
            const User = await getUserModel();
            const totalUsers = await User.count();
            const totalPages = Math.floor((totalUsers + pageSize - 1) / pageSize);

            const users = await User.find({}, "firstName lastName email created displayName", {skip: skip, limit: 50, sort: {"lastName": "asc"}}) || [];

            return res.json({
                users,
                totalPages
            });
        } catch (err) {
            return res.status(500).send("There was an error retrieving the list of users");
        }
    });

adminRouter.route("/api/admin/user")
    .all(async (req, res, next) => {
        try {
            const user = await acquireUser(req);

            rbac.check(user).is("admin").can("remove user", function (err, results) {
                if (!results){
                    return res.sendStatus(401);
                }
                next();
            });

        } catch (err) {
            return res.sendStatus(401);
        }
    })
    .delete(async function (req, res) {
        try {
            const {email} = req.body;
            const User = await getUserModel();
            const user = await User.find({email: email});

            if (user) {
                await User.remove({email: email});
                return res.sendStatus(200);
            } else {
                return res.status(404).send("The requested user does not exist.");
            }
        }
        catch (err) {
            return res.status(500).send("There was an error attempting to remove user");
        }
    });

async function acquireUser(req){
    const User = await getUserModel();
    const {userInfo = {}} = req.session;
    return await User.findOne({email: userInfo.email});
}

export default adminRouter;