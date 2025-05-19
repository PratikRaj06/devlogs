import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models.js";
import dotenv from "dotenv";
dotenv.config();

// Function to Send Response
const sendResponse = (res, statusCode, data) => {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
};

const JWT_SECRET = process.env.JWT_SECRET;

export const authRoutes = async (req, res) => {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", async () => {
        try {
            const data = JSON.parse(body);

            if (req.url === "/login" && req.method === "POST") {
                const { username, password } = data;

                if (!username || !password) {
                    return sendResponse(res, 400, { error: "Username and password are required" });
                }

                const user = await User.findOne({ username });
                if (!user) {
                    return sendResponse(res, 404, { error: "User not found" });
                }

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return sendResponse(res, 401, { error: "Incorrect password" });
                }

                const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "7d" });

                return sendResponse(res, 200, { message: "Login successful", token });
            }

            else if (req.url === "/register" && req.method === "POST") {
                const { username, fullName, password } = data;

                if (!username || !fullName || !password) {
                    return sendResponse(res, 400, { error: "All fields are required" });
                }

                const existingUser = await User.findOne({ username });
                if (existingUser) {
                    return sendResponse(res, 409, { error: "Username already exists" }); // 409 Conflict is more appropriate
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                const newUser = new User({
                    username,
                    fullName,
                    password: hashedPassword,
                    joinedDate: new Date()
                });

                await newUser.save();

                return sendResponse(res, 201, { message: "User registered successfully" });
            }

            sendResponse(res, 404, { error: "Invalid Route" }); // Handles unknown requests
        } catch (error) {
            console.error(error);
            sendResponse(res, 500, { error: `Internal Server Error ${error}` });
        }
    });
};
