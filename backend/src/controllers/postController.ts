import type { Request, Response } from 'express';
import Post from '../models/Post';
import Bookmark from '../models/Bookmark';
import Comment from '../models/Comment';
import { IUser } from '../models/User';

// Create a new post
export const createPost = async (req: Request, res: Response) => {
  const { title, content } = req.body;
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const newPost = new Post({
      title,
      content,
      author: (req.user as IUser)._id
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new comment on a post
export const createComment = async (req: Request, res: Response) => {
  const { text } = req.body;
  const { postId } = req.params;
  
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    console.log(req.user);
    const comment = new Comment({
      text,
      author: req.user.user.id
    });

    await comment.save();

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push(comment._id);
    await post.save();

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get posts with pagination
export const getPosts = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 ,searchQuery} = req.query;
  
  try {
    const posts = await Post.find({ title: { $regex: searchQuery, $options: 'i' } })
      .populate('author', 'name email')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Post.countDocuments();
    res.json({ posts, total });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a single post by ID with populated author & comments
export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name email' }
      });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Bookmark a post
export const bookmarkPost = async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already bookmarked
    const exists = await Bookmark.findOne({
      user: req.user.user.id,
      post: postId
    });
    if (exists) {
      return res.status(400).json({ message: 'Post already bookmarked' });
    }

    const bookmark = new Bookmark({
      user: req.user.user.id,
      post: postId
    });

    await bookmark.save();
    res.status(201).json(bookmark);
  } catch (error) {
    console.error('Error bookmarking post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all bookmarks for the logged-in user
export const getBookmarks = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const bookmarks = await Bookmark.find({ user: req.user.user.id})
      .populate({
        path: 'post',
        populate: { path: 'author', select: 'name email' }
      });

    res.json(bookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
