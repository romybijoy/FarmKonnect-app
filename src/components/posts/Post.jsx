import React, { useState } from "react";
import prof1 from "../../assets/prof1.jpeg";
import prof2 from "../../assets/prof4.jpeg";
import prof3 from "../../assets/prof2.jpeg";
import prof4 from "../../assets/prof3.jpeg";
import "../../index.css";
import NoPosts from "./NoPosts";
import { parseISO, format } from 'date-fns';

function Post({ data }) {
  const [expandedPosts, setExpandedPosts] = useState({});
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        id: 1,
        username: "John Doe",
        img: prof1,
      },
      img: prof1,
      text: "Hello, excited to share something new! This is a longer version of the post to test the more/less toggle functionality. Stay tuned for more updates.",
    },
    {
      id: 2,
      user: {
        id: 2,
        username: "Alice Bow",
        img: prof4,
      },
      img: prof1,
      text: "Just finished a cool project! Let me know what you think.",
    },
    {
      id: 3,
      user: {
        id: 3,
        username: "Manoj",
        img: prof2,
      },
      img: prof1,
      text: "Another productive day coding React apps and drinking coffee.",
    },
    {
      id: 4,
      user: {
        id: 4,
        username: "Albin Joe",
        img: prof3,
      },
      img: prof1,
      text: "Exploring new design ideas with Tailwind CSS. Loving the results so far!",
    },
  ]);

  const handleToggleMore = (postId) => {
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  function formatDate(dateString) {
  const cleanDateString = dateString.split('.')[0];
  const parsedDate = parseISO(cleanDateString);
  return format(parsedDate, 'dd MMM yyyy, hh:mm a');
}
  // if (![data].length) return <NoPosts />;
  console.log(data);
  return (
    <div className="p-4 max-w-screen-md mx-auto">
      {data.length > 0 ? (
        data.map((post) => {
          const isExpanded = expandedPosts[post?.id];
          const previewText = post?.content.slice(0, 70);
          return (
            <div
              key={post?.id}
              className="bg-white rounded-xl shadow-md p-4 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={post?.image}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border mr-3"
                  />
                  <div>
                    <h6 className="font-semibold text-sm">{post?.userName}</h6>
                    <p className="text-xs text-gray-500">
                      {post?.createdAt ? formatDate(post.createdAt) : ""}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3 text-gray-500">
                  <i className="bi bi-three-dots"></i>
                  <i className="bi bi-x"></i>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-gray-700 text-sm w-full">
                  {isExpanded ? post?.content : previewText}
                  {post?.content.length > 70 && (
                    <button
                      onClick={() => handleToggleMore(post?.id)}
                      className="ml-2 text-blue-500 text-xs"
                    >
                      {isExpanded ? "Less" : "More"}
                    </button>
                  )}
                </div>
                <img
                  src={post.postImage}
                  alt="Post"
                  className="w-full max-h-[400px] mt-3 rounded-lg object-cover"
                />
              </div>

              <div className="flex justify-between text-sm text-gray-600 mt-4">
                <div>23 likes</div>
                <div>60 comments</div>
                <div>19 reposts</div>
              </div>

              <hr className="my-3" />

              <div className="flex justify-between text-sm font-medium text-gray-700">
                <button className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded">
                  <i className="bi bi-hand-thumbs-up"></i> Like
                </button>
                <button className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded">
                  <i className="bi bi-chat-left-text"></i> Comment
                </button>
                <button className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded">
                  <i className="bi bi-arrow-repeat"></i> Repost
                </button>
                <button className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded">
                  <i className="bi bi-send"></i> Send
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <NoPosts/>
      )}
    </div>
  );
}

export default Post;
