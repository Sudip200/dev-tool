import { Request, Response } from "express";
import Comment, { IComment } from "../models/Comment";
import Post, { IPost } from "../models/Post";

// 1️⃣ Create a comment on a post
export const createComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { postId, text } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const post: IPost | null = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const comment: IComment = await Comment.create({
      post: postId,
      author: userId,
      text,
    });

    res.status(201).json(comment);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 2️⃣ Reply to a comment
export const replyToComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { parentId, text } = req.body;
    const userId = req.user.user.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const parentComment: IComment | null = await Comment.findById(parentId);
    if (!parentComment) {
      res.status(404).json({ message: "Parent comment not found" });
      return;
    }

    const reply: IComment = await Comment.create({
      author: userId,
      text,
      comments: [],
    });

    // Optionally push reply to parent comments array
    parentComment.comments.push(reply._id);
    await parentComment.save();

    res.status(201).json(reply);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 3️⃣ Get all comments for a post (with nested replies)
export const getCommentsForPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params;

   
    const post = await Post.findById(postId)
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
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

