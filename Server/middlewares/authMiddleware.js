const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// Middleware to handle user authentication
const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  // Check if the request headers contain an authorization token
  if (req.headers?.authorization?.startsWith("Bearer")) {
    // Extract the token from the authorization header
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        // Verify the token using the secret key and get the user information
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(process.env.JWT_SECRET);
        // Find the user in the database using the decoded user ID
        const user = await User.findById(decoded?.id);
        // Attach the user information to the request object
        req.user = user;
        // Proceed to the next middleware
        next();
      }
    } catch (error) {
      // If token verification fails, throw an error
      throw new Error("Authorization token expired, please login again!");
    }
  }
});

module.exports = authMiddleware;
