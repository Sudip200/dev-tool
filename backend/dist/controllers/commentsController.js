"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommentsForPost = exports.replyToComment = exports.createComment = void 0;
const Comment_1 = __importDefault(require("../models/Comment"));
const Post_1 = __importDefault(require("../models/Post"));
// 1️⃣ Create a comment on a post
const createComment = async (req, res) => {
    try {
        const { postId, text } = req.body;
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const post = await Post_1.default.findById(postId);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        const comment = await Comment_1.default.create({
            post: postId,
            author: userId,
            text,
        });
        res.status(201).json(comment);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.createComment = createComment;
// 2️⃣ Reply to a comment
const replyToComment = async (req, res) => {
    try {
        const { parentId, text } = req.body;
        const userId = req.user.user.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const parentComment = await Comment_1.default.findById(parentId);
        if (!parentComment) {
            res.status(404).json({ message: "Parent comment not found" });
            return;
        }
        const reply = await Comment_1.default.create({
            author: userId,
            text,
            comments: [],
        });
        // Optionally push reply to parent comments array
        parentComment.comments.push(reply._id);
        await parentComment.save();
        res.status(201).json(reply);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.replyToComment = replyToComment;
// 3️⃣ Get all comments for a post (with nested replies)
const getCommentsForPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post_1.default.findById(postId)
            .populate({
            path: "comments",
            populate: [
                { path: "author", select: "name email" },
                {
                    path: "comments",
                    populate: [
                        { path: "author", select: "name email" },
                        {
                            path: "comments",
                            populate: { path: "author", select: "name email" }
                        }
                    ]
                }
            ]
        })
            .lean();
        res.json(post?.comments);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getCommentsForPost = getCommentsForPost;
