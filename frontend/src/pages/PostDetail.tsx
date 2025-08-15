import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
interface Post{
    _id: string;
    title: string;
    content: string;
}

const PostDetail = () => {
    const routeParams  = useParams()
    const [post, setPost] = useState<Post | null>(null);
    useEffect(()=>{
        const fetchPost = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${routeParams.id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setPost(response.data);
            } catch (error) {
                console.error('Error fetching post:', error);
            }
        };

        fetchPost();
    },[routeParams.id]);
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">{post?.title}</h2>
          {
            post ? (
              <div
                key={post._id}
                className="bg-white p-4 rounded shadow hover:shadow-md transition"
              >
                <h2 className="text-lg font-bold">{post.title}</h2>
                <p
                  className="text-gray-600"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
  
    );
}
export default PostDetail;

  

