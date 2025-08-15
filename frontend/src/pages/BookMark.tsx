import axios from "axios";
import { useEffect, useState } from "react"

interface BookMark {
    _id: string;
    post: {
        _id: string;
        title: string;
    };
}

const BookMark: React.FC = () => {
    const [bookmarks, setBookmarks] = useState<BookMark[]>([]);
    useEffect(() => {
        const fetchBookmarks = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/bookmarks/me`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                // Handle the response data
                setBookmarks(response.data);
            } catch (error) {
                console.error('Error fetching bookmarks:', error);
            }
        };

        fetchBookmarks();
    },[]);

    return (
    <div>
        <h2 className="text-2xl font-bold mb-6 text-center">Bookmarks</h2>
        <ul>
            {bookmarks.map((bookmark) => (
                <li key={bookmark._id} className="border-b py-2">
                    <a href={`/post/${bookmark.post._id}`} className="text-blue-500 hover:underline">
                        {bookmark.post.title}
                    </a>
                </li>
            ))}
        </ul>
    </div>   
);
}

export default BookMark;