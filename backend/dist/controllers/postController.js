"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookmarks = exports.bookmarkPost = exports.getPostById = exports.getPosts = exports.createComment = exports.createPost = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const Bookmark_1 = __importDefault(require("../models/Bookmark"));
const Comment_1 = __importDefault(require("../models/Comment"));
// Create a new post
const createPost = async (req, res) => {
    const { title, content } = req.body;
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const newPost = new Post_1.default({
            title,
            content,
            author: req.user._id
        });
        await newPost.save();
        res.status(201).json(newPost);
    }
    catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createPost = createPost;
// Create a new comment on a post
const createComment = async (req, res) => {
    const { text } = req.body;
    const { postId } = req.params;
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        console.log(req.user);
        const comment = new Comment_1.default({
            text,
            author: req.user.user.id
        });
        await comment.save();
        const post = await Post_1.default.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        post.comments.push(comment._id);
        await post.save();
        res.status(201).json(comment);
    }
    catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createComment = createComment;
// Get posts with pagination
const getPosts = async (req, res) => {
    const { page = 1, limit = 10, searchQuery } = req.query;
    try {
        const posts = await Post_1.default.find({ title: { $regex: searchQuery, $options: 'i' } })
            .populate('author', 'name email')
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        const total = await Post_1.default.countDocuments();
        res.json({ posts, total });
    }
    catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getPosts = getPosts;
// Get a single post by ID with populated author & comments
const getPostById = async (req, res) => {
    try {
        const post = await Post_1.default.findById(req.params.id)
            .populate('author', 'name email')
            .populate({
            path: 'comments',
            populate: { path: 'author', select: 'name email' }
        });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    }
    catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getPostById = getPostById;
// Bookmark a post
const bookmarkPost = async (req, res) => {
    const { postId } = req.params;
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Check if post exists
        const post = await Post_1.default.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        // Check if already bookmarked
        const exists = await Bookmark_1.default.findOne({
            user: req.user.user.id,
            post: postId
        });
        if (exists) {
            return res.status(400).json({ message: 'Post already bookmarked' });
        }
        const bookmark = new Bookmark_1.default({
            user: req.user.user.id,
            post: postId
        });
        await bookmark.save();
        res.status(201).json(bookmark);
    }
    catch (error) {
        console.error('Error bookmarking post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.bookmarkPost = bookmarkPost;
// Get all bookmarks for the logged-in user
const getBookmarks = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const bookmarks = await Bookmark_1.default.find({ user: req.user.user.id })
            .populate({
            path: 'post',
            populate: { path: 'author', select: 'name email' }
        });
        res.json(bookmarks);
    }
    catch (error) {
        console.error('Error fetching bookmarks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getBookmarks = getBookmarks;
