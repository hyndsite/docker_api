"use strict";

// ====================
//  /api/user
// ====================

/* eslint-disable no-console */

import {Router}                                 from "express";
import cors                                     from "cors";
import {getUserModel}                           from "../data_access/modelFactory";
import colors                                   from "colors";
import Promise                                  from "bluebird";
import {registrationSchema, loginSchema}        from "../validation/validationSchemas";
import RBAC                                     from "../data_access/rbac";

const authenticationRouter = Router();
const rbac = new RBAC();

authenticationRouter.route("/api/user/register")
    .post(async function (req, res) {
        try {

            const User = await getUserModel();

            req.checkBody(registrationSchema);
            const errors = req.validationErrors();

            if (errors) {
                return res.status(500).json(errors);
            }

            const {email, password, firstName, lastName} = req.body;
            const existingUser = await User.findOne({username: email}).exec();
            if (existingUser) {
                return res.status(409).send(`The specified email ${email} address already exists.`);
            }

            const submittedUser = {
                firstName: firstName,
                lastName: lastName,
                username: email,
                email: email,
                password: password,
                created: Date.now()
            };

            const user = new User(submittedUser);

            await user.save()
                .then(function (doc) {
                    if (doc) {
                        console.log(colors.yellow(`Created User ${JSON.stringify(doc)}`));
                    }
                })
                .catch(function (err) {
                    if (err) {
                        console.log(colors.yellow(`Error occurred saving User ${err}`));
                    }
                });

            res.status(201).json({user: {firstName: user.firstName, lastName: user.lastName, email: user.email}});
        } catch (err) {
            console.log(colors.red(err));
            res.status(500).send("There was an error creating user.  Please try again later");
        }
    });


authenticationRouter.route("/api/user/login")
    .post(async function (req, res) {
        try {
            const User = await getUserModel();
            const {email, password} = req.body;

            req.checkBody(loginSchema);
            const errors = req.validationErrors();

            const existingUser = await User.findOne({username: email}).exec();

            if (!errors && existingUser && await existingUser.passwordIsValid(password)) {
                const userInfo = {
                    id: existingUser._id,
                    firstName: existingUser.firstName,
                    lastName: existingUser.lastName,
                    email: existingUser.email,
                    roles: existingUser.roles,
                    displayName: existingUser.displayName,
                };

                req.session.login({email: existingUser.email}, function (err) {
                    if (err) {
                        return res.status(500).send("There was an error logging in. Please try again later.");
                    }
                });

                res.status(200).json(userInfo);
            } else {
                res.status(401).send("Invalid username or password");
            }
        }
        catch (err) {
            res.status(500).send("There was an error attempting to login. Please try again later.");
        }
    });

authenticationRouter.route("/api/user/logout")
    .get(function (req, res) {
        return new Promise(function (resolve, reject) {
            try {
                if (req.session) {
                    req.session.destroy();
                    resolve(res.sendStatus(200));
                }
            }
            catch (err) {
                return reject(res.sendStatus(500));
            }
        });

    });

authenticationRouter.route("/api/user")
    .all(async(req, res, next) => {
        const user = await acquireUser(req);

        rbac.check(user).is("user", function (err, results) {
            if (!results) {
                console.log("The results are: " + results);
                return res.status(401).send("Please log in and try again.");
            }
            next();
        });
    })
    .post(async function (req, res) {
        try {
            const User = await getUserModel();
            const {userInfo = {}} = req.session;
            const {user} = req.body;
            if (!user) {
                return res.sendStatus(304);
            }

            const currentUser = await User.findOne({email: userInfo.email}).exec();
            if (!currentUser) {
                return res.status(401).send("Please login and try again.");
            }


            currentUser.firstName = user.firstName;
            currentUser.lastName = user.lastName;
            currentUser.displayName = user.displayName;

            const updatedUser = await currentUser.save();

            return res.status(200).json({
                id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                username: updatedUser.email,
                roles: updatedUser.roles,
                displayName: updatedUser.displayName,
            });
        }
        catch (err) {
            res.status(500).send("There was an error updating profile. Please try again later");
        }
    });


async function acquireUser(req) {
    const User = await getUserModel();
    const {userInfo = {}} = req.session;
    return await User.findOne({email: userInfo.email});
}
export default authenticationRouter;