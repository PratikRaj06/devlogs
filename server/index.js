import dotenv from "dotenv";
dotenv.config();
import http from "http";
import mongoose from "mongoose";
import { authRoutes } from "./routes/authRoutes.js";
import { blogRoutes } from "./routes/blogRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";


// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_STRING);
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error);
        process.exit(1);
    }
};

// Start DB Connection
connectDB();

// Function to Send Response
const sendResponse = (res, statusCode, data) => {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
};

// Create HTTP Server
const server = http.createServer(async (req, res) => {
    // CORS Headers
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Handle Preflight (OPTIONS) Requests for CORS
    if (req.method === "OPTIONS") {
        res.writeHead(204); // No Content response
        res.end();
        return;
    }

    // Authentication Routes
    if (req.url.startsWith("/login") || req.url.startsWith("/register")) {
        await authRoutes(req, res);
        return;
    }

    // Blog Routes
    if (req.url.startsWith("/create-blog") || req.url.startsWith("/delete-blog") || req.url.startsWith("/update-blog") || req.url.startsWith("/blog") || req.url.startsWith('/search')) {
        await blogRoutes(req, res);
        return;
    }

    if (req.url.startsWith("/user")) {
        await userRoutes(req, res);
        return
    }
    // Default 404 Response
    sendResponse(res, 404, { error: "Not Found" });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
