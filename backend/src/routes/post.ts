
import { Router } from 'express';
import { createPost, createComment, getPosts, getPostById, bookmarkPost, getBookmarks } from '../controllers/postController';
import { auth } from '../middleware/auth';
import { getCommentsForPost, replyToComment } from '../controllers/commentsController';

const router = Router();

router.post('/', auth, createPost);
router.get('/posts', getPosts);
router.get('/posts/:id', getPostById);
router.post('/posts/:postId/comments', auth, createComment);
router.post('/posts/:postId/bookmark', auth, bookmarkPost);
router.get('/posts/:postId/comments', auth, getCommentsForPost);
router.post('/posts/reply-to-comment', auth, replyToComment);
router.get('/bookmarks/me', auth, getBookmarks);


export default router;
