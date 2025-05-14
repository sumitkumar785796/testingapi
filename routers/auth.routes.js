const express = require("express");
const userroutes = express.Router();
const controller = require("../controllers/auth.controller");
const authmiddleware = require("../middleware/auth.middleware");

// POST /api/users- Send OTP (Registration or Login)
userroutes.route("/").post(controller.handleOtp);

// POST /api/users/verify - Verify OTP (for registration/login)
userroutes.route("/verify").post(controller.verifyOtp);

// GET /api/users/accessprofile - Get user profile (JWT token required)
userroutes.route("/accessprofile").get(authmiddleware, controller.AccessProfile);

// put /api/users/updateprofile - Update profile route (PUT or PATCH)
userroutes.route('/updateprofile').put(authmiddleware, controller.updateProfile);

// put /api/users/logout - Logout route
userroutes.route('/logout').get(controller.LogoutUser);

module.exports = userroutes;
