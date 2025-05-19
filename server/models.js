import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    joinedDate: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Blog Schema
const blogSchema = new mongoose.Schema({
    username: { type: String, required: true, ref: "User" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String }, // URL of the thumbnail image
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Auto-update `updatedAt` before saving
blogSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

const Blog = mongoose.model("Blog", blogSchema);

// Export Models
export { User, Blog };
