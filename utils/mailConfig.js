// mailConfig.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail", // or any other email service you prefer
    auth: {
        user: process.env.MAIL_USERNAME, // Your email address (e.g., "youremail@gmail.com")
        pass: process.env.MAIL_PASSWORD, // Your email password or app-specific password
    },
});

module.exports = {transporter};
