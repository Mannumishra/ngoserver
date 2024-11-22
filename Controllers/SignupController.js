const SignUp = require("../Models/SignupModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { transporter } = require("../utils/mailConfig");


// Error message collector
const errorMessage = [];

// Helper function to handle errors
const handleError = (err) => {
    errorMessage.length = 0; // Reset error messages
    if (err.code === 11000) {
        // Handle duplicate key error
        const field = Object.keys(err.keyValue)[0];
        errorMessage.push(`${field} already exists`);
    } else if (err.errors) {
        // Handle validation errors
        for (const field in err.errors) {
            errorMessage.push(err.errors[field].message);
        }
    } else {
        errorMessage.push(err.message);
    }
};

// Create a new signup
const createSignup = async (req, res) => {
    try {
        console.log(req.body)
        // Generate the next logId by finding the highest current logId and incrementing it
        const signupsCount = await SignUp.countDocuments();
        const logId = `SBVKS${(signupsCount + 1).toString().padStart(3, "0")}`;

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        const hashedconfPassword = await bcrypt.hash(req.body.confirmPassword, 12);
        const newSignup = new SignUp({
            ...req.body,
            logId, // Assign the incremented logId
            password: hashedPassword,
            confirmPassword: hashedconfPassword
        });

        const savedSignup = await newSignup.save();

        // Send email with login details to the user
        const mailOptions = {
            from: process.env.MAIL_USERNAME, // Sender's email
            to: savedSignup.email, // Recipient's email (user's email)
            subject: "Welcome to Sai Balika Vikas Kalyan Society - Your Login Details",
            html: `
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f8f8;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <div style="text-align: center; padding: 20px 0;">
                            <h1 style="color: #ff6600; margin: 0;">Sai Balika Vikas Kalyan Society</h1>
                        </div>
                        <div style="padding: 20px;">
                            <p style="font-size: 16px; line-height: 1.5;">Hello <span style="font-weight: bold; color: #ff6600;">${savedSignup.firstName} ${savedSignup.lastName}</span>,</p>
                            <p style="font-size: 16px; line-height: 1.5;">Welcome to Sai Balika Vikas Kalyan Society! Your account has been successfully created.</p>
                            <p style="font-size: 16px; line-height: 1.5; font-weight: bold;">Your Login Details:</p>
                            <p style="font-size: 16px; line-height: 1.5;">Log IN ID: <span style="font-weight: bold; color: #ff6600;">${savedSignup.logId}</span></p>
                            <p style="font-size: 16px; line-height: 1.5;">Password: <span style="font-weight: bold; color: #ff6600;">${req.body.password}</span> (Please change it after logging in for security reasons)</p>
                            <p style="font-size: 16px; line-height: 1.5;">Thank you for joining us! We are excited to have you as part of our community.</p>
                        </div>
                        <div style="text-align: center; margin-top: 20px; font-size: 14px; color: #888888;">
                            <p>&copy; ${new Date().getFullYear()} Sai Balika Vikas Kalyan Society. All rights reserved.</p>
                            <p>For any inquiries, feel free to <a href="mailto:contact@sai-balika-vikas.org" style="color: #ff6600; text-decoration: none;">contact us</a>.</p>
                        </div>
                    </div>
                </body>
            `,
        };


        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Error sending email:", err);
            } else {
                console.log("Email sent:", info.response);
            }
        });


        res.status(201).json(savedSignup);
    } catch (err) {
        console.error("Error:", err); // Debugging
        handleError(err); // Collect errors
        if (err.name === "ValidationError") {
            res.status(400).json({ success: false, errors: errorMessage });
        } else if (err.code === 11000) {
            res.status(409).json({ success: false, errors: errorMessage });
        } else {
            res.status(500).json({ success: false, errors: ["Internal Server Error"] });
        }
    }
};

// Get all signups
const getAllSignups = async (req, res) => {
    try {
        const signups = await SignUp.find();
        res.status(200).json({
            success: true,
            message: "Record Found Successfully",
            data: signups.reverse()
        });
    } catch (err) {
        handleError(err);
        res.status(500).json({ success: false, errors: errorMessage });
    }
};

// Get a single signup by ID
const getSignupById = async (req, res) => {
    try {
        const signup = await SignUp.findById(req.params.id);
        if (!signup) {
            return res.status(404).json({ success: false, errors: ["Signup not found"] });
        }
        res.status(200).json({
            success: true,
            message: "Record Found Successfully",
            data: signup
        });
    } catch (err) {
        handleError(err);
        res.status(500).json({ success: false, errors: errorMessage });
    }
};

// Update a signup by ID
const updateSignupById = async (req, res) => {
    try {
        const updatedSignup = await SignUp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedSignup) {
            return res.status(404).json({ success: false, errors: ["Signup not found"] });
        }
        res.status(200).json(updatedSignup);
    } catch (err) {
        handleError(err);
        if (err.name === 'ValidationError') {
            res.status(400).json({ success: false, errors: errorMessage });
        } else {
            res.status(500).json({ success: false, errors: ['Internal Server Error'] });
        }
    }
};

// Delete a signup by ID
const deleteSignupById = async (req, res) => {
    try {
        const deletedSignup = await SignUp.findByIdAndDelete(req.params.id);
        if (!deletedSignup) {
            return res.status(404).json({ success: false, errors: ["Signup not found"] });
        }
        res.status(200).json({ success: true, message: "Signup deleted successfully" });
    } catch (err) {
        handleError(err);
        res.status(500).json({ success: false, errors: errorMessage });
    }
};


const loginUser = async (req, res) => {
    const { logId, password } = req.body;
    try {
        const user = await SignUp.findOne({ logId });
        if (!user) {
            return res.status(404).json({ success: false, errors: ["Invalid Log In Id"] });
        }
        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, errors: ["Invalid Password"] });
        }

        // Determine role and set corresponding key
        const secretKey = user.role === "ADMIN"
            ? process.env.SALT_KEY_ADMIN
            : process.env.SALT_KEY_USER;

        // Generate JWT Token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role,
            },
            secretKey,
            { expiresIn: "1h" } // Token expiry
        );

        // Respond with token and user details
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                logId: user.logId
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, errors: ["Internal Server Error"] });
    }
};


module.exports = {
    createSignup,
    getAllSignups,
    getSignupById,
    updateSignupById,
    deleteSignupById,
    loginUser
};
