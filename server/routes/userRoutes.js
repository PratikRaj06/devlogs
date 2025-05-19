import jwt from "jsonwebtoken";
import { Blog, User } from "../models.js";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Function to Send Response
const sendResponse = (res, statusCode, data) => {
    if (res.headersSent) return; // Prevent duplicate response
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
};

// Middleware-like function to Authenticate User
const authenticateUser = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            sendResponse(res, 404, { error: "Authorization token required" });
            return null;  // Ensure execution stops
        }

        const decodedUser = jwt.verify(token, JWT_SECRET);
        req.user = decodedUser;
        return decodedUser;
    } catch (error) {
        sendResponse(res, 404, { error: "Invalid or expired token" });
        return null; // Ensure execution stops
    }
};


// User Routes Handler
export const userRoutes = async (req, res) => {
    try {
        const user = await authenticateUser(req, res);
        if (!user) return;  // Stop execution if authentication fails

        // Get User Profile
        if (req.method === "GET" && req.url === "/user/profile") {
            const userData = await User.findOne({ username: user.username }, "fullName username joinedDate");
            if (!userData) {
                return sendResponse(res, 404, { error: "User not found" });
            }
            return sendResponse(res, 200, userData);
        }

        // Get All Blogs by User
        if (req.method === "GET" && req.url === "/user/blogs") {
            const blogs = await Blog.find({ username: user.username }, "thumbnail title description createdAt updatedAt");
            return sendResponse(res, 200, { blogs });
        }

        // Invalid Route
        return sendResponse(res, 403, { error: "Invalid route" });

    } catch (error) {
        return sendResponse(res, 500, { error: `Unexpected Server Error: ${error.message}` });
    }
};
