import jwt from "jsonwebtoken";
import { Blog } from "../models.js";
import dotenv from "dotenv";
dotenv.config();
// Ensure JWT Secret is defined
const JWT_SECRET = process.env.JWT_SECRET;

// Function to Send Response
const sendResponse = (res, statusCode, data) => {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
};

// Middleware-like function to Authenticate User
const authenticateUser = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            sendResponse(res, 401, { error: "Authorization token required" });
            return null;
        }

        const decodedUser = jwt.verify(token, JWT_SECRET);
        req.user = decodedUser;
        return decodedUser;
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            sendResponse(res, 404, { error: "Token expired, please log in again" });
        } else {
            sendResponse(res, 404, { error: "Invalid or expired token" });
        }
        return null;
    }
};

// Helper function to parse JSON body
const parseRequestBody = async (req) => {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
            try {
                body = body.trim();
                if (!body) return reject(new Error("Empty request body"));
                resolve(JSON.parse(body));
            } catch (error) {
                reject(new Error("Invalid JSON format"));
            }
        });

        req.on("error", (error) => reject(error));
    });
};

// Blog Routes Handler
export const blogRoutes = async (req, res) => {
    try {

        // Blog Search Route
        if (req.method === "GET" && req.url.startsWith("/search")) {
            try {
                const user = await authenticateUser(req, res);
                if (!user) return;

                const url = new URL(req.url, `http://${req.headers.host}`);
                const query = url.searchParams.get("query");

                if (!query) {
                    return sendResponse(res, 400, { error: "Search query is required" });
                }

                try {
                    const blogs = await Blog.aggregate([
                        {
                            $search: {
                                "index": "searching", // Use your Search Index name
                                "text": {
                                    "query": query,
                                    "path": ["title", "description"], // Search in these fields
                                    "fuzzy": { "maxEdits": 1 } // Allow typo tolerance
                                }
                            }
                        },
                        {
                            $sort: { "score": { "$meta": "textScore" } } // Sort by relevance
                        },
                        {
                            $project: {
                                title: 1,
                                thumbnail: 1,
                                description: 1,
                                createdAt: 1,
                                _id: 1 // Exclude _id if not needed
                            }
                        }
                    ]);


                    return sendResponse(res, 200, { blogs });
                } catch (dbError) {
                    return sendResponse(res, 500, { error: `Database Error: ${dbError.message}` });
                }
            } catch (error) {
                return sendResponse(res, 500, { error: `Internal Server Error: ${error.message}` });
            }
        }


        // Get a particular blog
        if (req.method === "GET" && req.url.startsWith("/blog/")) {
            const user = await authenticateUser(req, res);
            if (!user) return;
            try {
                const urlParts = req.url.split("/"); // Extract blog ID from URL
                const blogId = urlParts[urlParts.length - 1];
                console.log(blogId)
                if (!blogId) {
                    return sendResponse(res, 400, { error: "Blog ID is required" });
                }

                const blog = await Blog.findById(blogId);
                if (!blog) {
                    return sendResponse(res, 401, { error: "Blog not found" });
                }

                sendResponse(res, 200, { blog });
            } catch (error) {
                sendResponse(res, 500, { error: `Internal Server Error: ${error.message}` });
            }
        }
        // Create Blog
        else if (req.method === "POST" && req.url === "/create-blog") {
            const user = await authenticateUser(req, res);
            if (!user) return; // Stop execution if authentication fails

            try {
                const { title, description, thumbnail, content } = await parseRequestBody(req);
                if (!title || !description || !content) {
                    return sendResponse(res, 400, { error: "Title, description, and content are required" });
                }

                const newBlog = new Blog({
                    username: user.username,
                    title,
                    description,
                    thumbnail,
                    content,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                await newBlog.save();
                sendResponse(res, 201, { message: "Blog added successfully", blog_id: newBlog._id });

            } catch (error) {
                sendResponse(res, 500, { error: `Internal Server Error: ${error.message}` });
            }
        }

        // Delete Blog (ID in body)
        else if (req.method === "DELETE" && req.url === "/delete-blog") {
            const user = await authenticateUser(req, res);
            if (!user) return;

            try {
                const { blogId } = await parseRequestBody(req);
                if (!blogId) return sendResponse(res, 400, { error: "Blog ID is required" });

                const blog = await Blog.findById(blogId);
                if (!blog) return sendResponse(res, 401, { error: "Blog not found" });

                if (blog.username !== user.username) {
                    return sendResponse(res, 403, { error: "You can only delete your own blog" });
                }

                await Blog.findByIdAndDelete(blogId);
                sendResponse(res, 200, { message: "Blog deleted successfully" });

            } catch (error) {
                sendResponse(res, 500, { error: `Internal Server Error: ${error.message}` });
            }
        }

        // Update Blog (ID in body)
        else if (req.method === "PUT" && req.url === "/update-blog") {
            const user = await authenticateUser(req, res);
            if (!user) return;

            try {
                const { blogId, title, description, thumbnail, content } = await parseRequestBody(req);
                if (!blogId) return sendResponse(res, 400, { error: "Blog ID is required" });

                const blog = await Blog.findById(blogId);
                if (!blog) return sendResponse(res, 401, { error: "Blog not found" });

                if (blog.username !== user.username) {
                    return sendResponse(res, 403, { error: "You can only update your own blog" });
                }

                // Update only provided fields
                if (title) blog.title = title;
                if (description) blog.description = description;
                if (thumbnail) blog.thumbnail = thumbnail;
                if (content) blog.content = content;
                blog.updatedAt = new Date();

                await blog.save();
                sendResponse(res, 200, { message: "Blog updated successfully", blog_id: blog._id });

            } catch (error) {
                sendResponse(res, 500, { error: `Internal Server Error: ${error.message}` });
            }
        }

        // Invalid Route
        else {
            sendResponse(res, 403, { error: "Invalid route" });
        }
    } catch (error) {
        sendResponse(res, 500, { error: `Unexpected Server Error: ${error.message}` });
    }
};
