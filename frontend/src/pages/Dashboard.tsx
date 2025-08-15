import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { MessageCircle, Bookmark, Search, Code, Layers, User, Settings, Home, Tag, X, Send, Reply, Plus } from "lucide-react";
import { Link } from "react-router-dom";

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

interface CommentProps {
  comment: Comment;
  replyPanelOpen: string | null;
  setReplyPanelOpen: React.Dispatch<React.SetStateAction<string | null>>;
  replyText: string;
  setReplyText: React.Dispatch<React.SetStateAction<string>>;
  handleReplyToComment: (id: string) => void;
  depth?: number;
}

const CommentItem: React.FC<CommentProps> = ({
  comment,
  replyPanelOpen,
  setReplyPanelOpen,
  replyText,
  setReplyText,
  handleReplyToComment,
  depth = 0,
}) => {
  return (
    <div className={`border-l-2 border-gradient-to-b from-blue-200 to-purple-200 pl-4 py-3 ${depth > 0 ? 'ml-6 mt-2' : ''} bg-gradient-to-r from-white to-gray-50 rounded-r-lg`}>
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {comment.author.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-gray-900">{comment.author.name}</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">just now</span>
          </div>
          <p className="text-gray-800 leading-relaxed">{comment.text}</p>
          
          <button
            onClick={() => setReplyPanelOpen(replyPanelOpen === comment._id ? null : comment._id)}
            className="mt-2 flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors duration-200 text-sm font-medium"
          >
            <Reply className="w-3 h-3" />
            <span>Reply</span>
          </button>
        </div>
      </div>

      {/* Reply input */}
      {replyPanelOpen === comment._id && (
        <div className="mt-4 ml-11 animate-in slide-in-from-top-2 duration-200">
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <textarea
              placeholder="Write a thoughtful reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
              rows={3}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setReplyPanelOpen(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReplyToComment(comment._id)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
              >
                <Send className="w-4 h-4" />
                <span>Reply</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render nested replies recursively */}
      {comment.comments && comment.comments.length > 0 && (
        <div className="mt-3 space-y-2">
          {comment.comments.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              replyPanelOpen={replyPanelOpen}
              setReplyPanelOpen={setReplyPanelOpen}
              replyText={replyText}
              setReplyText={setReplyText}
              handleReplyToComment={handleReplyToComment}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

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
        `${import.meta.env.VITE_API_URL}/posts?page=${page}&limit=10&searchQuery=${encodeURIComponent(search)}`
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

  const handleBookMark = async (postId: string) => {
    try {
      if (postId) {
        await axios.post(`${import.meta.env.VITE_API_URL}/posts/${postId}/bookmark`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
      } else {
        console.error("No post selected");
      }
    } catch (err) {
      console.error("Error bookmarking post", err);
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
        if (selectedPost) fetchComments(selectedPost._id);
      } catch (err) {
        console.error("Error replying to comment", err);
      }
    }
  }

  const tags = ['python', 'javascript', 'react'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Enhanced Navbar */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DevPlatform
              </h1>
            </div>
            <div className="hidden md:flex space-x-1">
              {[
                { icon: Home, label: 'Dashboard' },
                { icon: User, label: 'Profile' },
                { icon: Settings, label: 'Settings' }
              ].map(({ icon: Icon, label }) => (
                <a key={label} className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all duration-200 cursor-pointer">
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex flex-row w-full gap-6 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Sidebar */}
        <div id="sidebar" className="hidden lg:block w-64">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 sticky top-24">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Navigation</h2>
            </div>
            <div className="space-y-2">
              {[
                { icon: Home, label: 'Dashboard', active: true },
                { icon: User, label: 'Profile' },
                { icon: Bookmark, label: 'Bookmarks', isLink: true },
                { icon: Settings, label: 'Settings' }
              ].map(({ icon: Icon, label, active, isLink }) => {
                
                const props = isLink ? { to: "/bookmarks" } : {};
                return (
                  <div key={label} {...props} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    active 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                  }`}>
                     <Link  to={`/${label.toLowerCase()}`}>
                     <Icon className="w-5 h-5" />
                    </Link>
                     <Link   to={`/${label.toLowerCase()}`}>
                     <span className="font-medium">{label}</span>
                    </Link>
                   
                   
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div id="main-content" className="flex-1 max-w-4xl">
          {/* Enhanced Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for questions, topics, or solutions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg placeholder-gray-400"
              />
            </div>
            
            {/* Enhanced Tags */}
            <div className="flex flex-wrap gap-3 mt-4">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearch(tag)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 text-blue-800 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <Tag className="w-3 h-3" />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Posts */}
          <div className="space-y-6">
            {posts.map((post, index) => (
              <article
                key={post._id}
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] animate-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">{post.title}</h2>
                  <button 
                    onClick={() => handleBookMark(post._id)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>
                
                <div 
                  className="text-gray-600 leading-relaxed mb-4"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenComments(post)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>View Comments</span>
                  </button>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>2 hours ago</span>
                    <span>•</span>
                    <span>5 min read</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={observerRef} className="h-10"></div>
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </main>

      {/* Enhanced Comments Modal */}
      {showModal && selectedPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedPost.title}</h3>
                  <p className="text-blue-100 text-sm">Join the discussion below</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex flex-col h-[calc(90vh-120px)]">
              {/* Comments list */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <CommentItem
                      key={comment._id}
                      comment={comment}
                      replyPanelOpen={replyPanelOpen}
                      setReplyPanelOpen={setReplyPanelOpen}
                      replyText={replyText}
                      setReplyText={setReplyText}
                      handleReplyToComment={handleReplyToComment}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No comments yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>

              {/* Add comment */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                    Y
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="Share your thoughts, ask questions, or provide helpful insights..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                      rows={3}
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={handleAddComment}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Comment</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;