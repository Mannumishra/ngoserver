const jwt = require("jsonwebtoken");

// Middleware to verify token and role
const verifyToken = (roles) => {
    return (req, res, next) => {
        console.log(req.headers.authorization)
        const token = req.headers.authorization;
        if (!token) {
            // Redirect to the login page if the token is missing
            return res.redirect("http://localhost:3001/Login");
        }

        // Extract role-specific secret key
        const secretKey = roles.includes("ADMIN")
            ? process.env.SALT_KEY_ADMIN
            : process.env.SALT_KEY_USER;

        try {
            const decoded = jwt.verify(token, secretKey);
            req.user = decoded;

            // Check if the role is allowed
            if (!roles.includes(decoded.role)) {
                // Redirect if the role is unauthorized
                return res.redirect("http://localhost:3001/Login");
            }

            next(); // Proceed to the next middleware or route
        } catch (err) {
            // Redirect if the token is invalid
            return res.redirect("http://localhost:3001/Login");
        }
    };
};

module.exports = verifyToken;
