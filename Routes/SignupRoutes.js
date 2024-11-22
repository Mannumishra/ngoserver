const express = require("express");
const { createSignup, getAllSignups, getSignupById, updateSignupById, deleteSignupById, loginUser } = require("../Controllers/SignupController");
const verifyToken = require("../Middleware/verifyToken");
const SignupRouter = express.Router();

// Routes
SignupRouter.post("/signup", createSignup);
SignupRouter.get("/get-signups", getAllSignups);
SignupRouter.get("/get-user-details/:id", getSignupById);
SignupRouter.put("/update-signup/:id", updateSignupById);
SignupRouter.delete("/delete-signup/:id", deleteSignupById);



SignupRouter.post("/log-in", loginUser)

module.exports = SignupRouter;
