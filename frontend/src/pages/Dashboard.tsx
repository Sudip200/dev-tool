import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

interface Comment {
  _id: string;
  text: string;
  author: { name: string; email: string };
  comments: Comment[];
}

interface Post {
  _id: string;
  title: string;
  content: string;
}

const Dashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyText, setReplyText] = useState<string>("");
  const [replyPanelOpen, setReplyPanelOpen] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>("");

  const observerRef = useRef<HTMLDivElement | null>(null);

  // Fetch posts from API
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts?page=${page}&limit=10&search=${encodeURIComponent(search)}`
      );
      setPosts((prev) => [...prev, ...res.data.posts]);
      setTotal(res.data.total);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching posts", err);
      setLoading(false);
    }
  }, [page, search]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && posts.length < total && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [posts, total, loading]);

  // Reset posts on search
  useEffect(() => {
    setPosts([]);
    setPage(1);
  }, [search]);

  // Fetch posts whenever page/search changes
  useEffect(() => {
    fetchPosts();
  }, [page, search, fetchPosts]);

  // Fetch comments for a post
  const fetchComments = async (postId: string) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${postId}/comments`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );
      setComments(res.data);
    } catch (err) {
      console.error("Error fetching comments", err);
    }
  };

  // Handle opening modal
  const handleOpenComments = (post: Post) => {
    setSelectedPost(post);
    setShowModal(true);
    fetchComments(post._id);
  };

  // Handle adding a comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost) return;
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/posts/${selectedPost._id}/comments`, {
        text: newComment
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setNewComment("");
      fetchComments(selectedPost._id);
    } catch (err) {
      console.error("Error adding comment", err);
    }
  };

  async function handleReplyToComment(_id: string): Promise<void> {
    setReplyPanelOpen(_id);
    if (replyText.trim()) {
       // Handle reply submission
       try {
         await axios.post(`${import.meta.env.VITE_API_URL}/posts/reply-to-comment`, {
           text: replyText,
           parentId: _id
         }, {
           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
         });
         setReplyText("");
         if(selectedPost) fetchComments(selectedPost._id);
       } catch (err) {
         console.error("Error replying to comment", err);
       }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold">Developer Platform</h1>
            <div className="flex space-x-4">
              <a className="px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-md">Dashboard</a>
              <a className="px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-md">Profile</a>
              <a className="px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-md">Settings</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="px-4 sm:px-0 mb-4">
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white p-4 rounded shadow hover:shadow-md transition"
            >
              <h2 className="text-lg font-bold">{post.title}</h2>
              <p
                className="text-gray-600"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              <button
                onClick={() => handleOpenComments(post)}
                className="mt-2 text-blue-600 hover:underline"
              >
                View Comments
              </button>
            </div>
          ))}
        </div>

        {/* Infinite scroll trigger */}
        <div ref={observerRef} className="h-10"></div>
        {loading && <p className="text-center py-4">Loading...</p>}
      </main>

      {/* Comments Modal */}
      {showModal && selectedPost && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-4 relative">
            <h3 className="text-xl font-bold mb-4">Comments for: {selectedPost.title}</h3>

            {/* Comments list */}
            <div className="max-h-80 overflow-y-auto space-y-3 mb-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="border-b pb-2">
                    <p className="text-sm text-gray-800"><strong>{comment.author.name}</strong>: {comment.text}</p>
                    {comment.comments && comment.comments.length > 0 && (
                      <div className="ml-4 mt-1 space-y-1">
                        {comment.comments.map((reply) => (
                          <p key={reply._id} className="text-xs text-gray-600">
                            ↳ <strong>{reply.author.name}</strong>: {reply.text}
                          </p>
                        ))}
                      </div>

                    )}
                    {
                      replyPanelOpen === comment._id && (
                        <div className="ml-4 mt-2">
                          <input
                            type="text"
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                          <button
                            onClick={() => handleReplyToComment(comment._id)}
                            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          >
                            Reply
                          </button>
                        </div>
                      )
                    }
                    <button
                      onClick={() => setReplyPanelOpen(comment._id)}
                      className="mt-2 text-blue-600 hover:underline"
                    >
                      Reply
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No comments yet.</p>
              )}
            </div>

            {/* Add comment */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded"
              />
              <button
                onClick={handleAddComment}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Send
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
