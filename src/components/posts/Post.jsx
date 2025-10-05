import React, { useEffect, useRef, useState } from "react";
import "../../index.css";
import NoPosts from "./NoPosts";
import { parseISO, format } from "date-fns";
import {
  likePost,
  toggleSavePost,
  repostPost,
  hidePost,
} from "../../redux/slices/PostSlice";
import { useDispatch, useSelector } from "react-redux";
import { FaShare } from "react-icons/fa";
import CommentSection from "./CommentSection";

function Post({ post }) {
  const [expandedPosts, setExpandedPosts] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState({});
  const dispatch = useDispatch();
  const [dropdownPostId, setDropdownPostId] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const dropdownRef = useRef(null);
  const userData = JSON.parse(localStorage.getItem("myInfo"));
  const { savedByPostId, saveCountsByPostId } = useSelector(
    (state) => state.post
  );
  const commentCount = useSelector(
    (state) => state.comments.counts[post.id] || 0
  );

  const likeData = useSelector((state) => state.post.likesByPostId[post?.id]);

  const saveData = useSelector((state) => state.post.savedByPostId[post?.id]);

  const isLiked = likeData?.liked || false;
  const likeCount = likeData?.likeCount || 0;

  const isSaved = saveData?.saved || false;
  const saveCount = saveData?.count || 0;

  const handleToggleMore = (postId) => {
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleSave = (id) => {
    dispatch(toggleSavePost({ postId: id, userId: userData.id }));
  };

  const handleDropdownToggle = (id) => {
    setDropdownOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Repost
  const handleRepost = () => {
    dispatch(
      repostPost({
        postId: post.id,
        userId: userData.id,
        userDto: {
          name: userData.name,
          profileImage: userData.profileImage,
        },
      })
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownPostId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // useEffect(() => {
  //   dispatch(fetchLikeCount(post.id));
  //   dispatch(fetchLikeStatus({ postId: post.id, userId: userData.id }));
  // }, [dispatch, post.id, userData.id]);

  function formatDate(dateString) {
    const cleanDateString = dateString.split(".")[0];
    const parsedDate = parseISO(cleanDateString);
    return format(parsedDate, "dd MMM yyyy, hh:mm a");
  }

  const isExpanded = expandedPosts[post.id];

  const content = post.repost
    ? post.originalPost?.content
    : post.content || "";
  const previewText = content.slice(0, 70);

  return (
    <div className="p-4 max-w-screen-md mx-auto">
      <div key={post.id} className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={post.image}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border mr-3"
            />
            <div>
              <h6 className="font-semibold text-sm">{post.userName}</h6>
              <p className="text-xs text-gray-500">
                {post.createdAt ? formatDate(post.createdAt) : ""}
              </p>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <div className="flex space-x-3 text-gray-500">
              <button
                onClick={() =>
                  setDropdownPostId((prev) =>
                    prev === post.id ? null : post.id
                  )
                }
              >
                <i className="bi bi-three-dots"></i>
              </button>
            </div>

            {dropdownPostId === post.id && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-md z-10 transition-all duration-200 ease-in-out animate-fadeIn">
                <ul className="text-sm text-gray-700">
                  <li
                    onClick={() =>
                      dispatch(
                        toggleSavePost({
                          postId: post.id,
                          userId: userData.id,
                        })
                      )
                    }
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {isSaved ? "Unsave Post" : "Save Post"}
                  </li>
                  <li
                    onClick={() =>
                      dispatch(
                        hidePost({ postId: post.id, userId: userData.id })
                      )
                    }
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Remove from Feed
                  </li>
                  {/* <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Report
                  </li> */}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-gray-700 text-sm w-full">
            {isExpanded ? content : previewText}
            {content.length > 70 && (
              <button
                onClick={() => handleToggleMore(post.id)}
                className="ml-2 text-blue-500 text-xs"
              >
                {isExpanded ? "Less" : "More"}
              </button>
            )}
          </div>
          {post.postImage && (
            <img
              src={post.postImage}
              alt="Post"
              className="w-full max-h-[400px] mt-3 rounded-lg object-cover"
            />
          )}
        </div>

        <div className="flex justify-between text-sm text-gray-600 mt-4">
          <div>
            <div>
              {likeCount ?? 0} {likeCount === 1 ? "like" : "likes"}
            </div>
          </div>
          <div>{commentCount} comments</div>
          {/* <div>19 reposts</div> */}
          <div>
            {" "}
            {saveCount ?? 0} {saveCount === 1 ? "save" : "saves"}
          </div>
        </div>

        <hr className="my-3" />

        <div className="flex justify-between text-sm font-medium text-gray-700">
          <button
            className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded"
            onClick={() =>
              dispatch(likePost({ postId: post.id, userId: userData.id }))
            }
          >
            <i
              className={`bi text-lg transition-colors duration-150 ${
                isLiked
                  ? "bi-hand-thumbs-up-fill text-blue-600"
                  : "bi-hand-thumbs-up text-gray-600"
              }`}
            ></i>{" "}
            Like
          </button>
          <button
            className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded"
            onClick={() => setShowComments((prev) => !prev)}
          >
            <i className="bi bi-chat-left-text"></i> Comment
          </button>
          <button
            className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded"
            onClick={handleRepost}
          >
            <FaShare className="text-base" /> Share
          </button>
        </div>

        <div>{showComments && <CommentSection postId={post.id} />}</div>

        {/* --- Repost View --- */}
        {post.repost && post.originalPostId && (
          <div className="border border-gray-200 rounded-lg bg-gray-50 mt-4 p-3">
            <div className="text-sm text-gray-500 mb-2">
              <span className="font-semibold">{post.userName}</span> shared this
              post
            </div>

            {/* Original Post Preview */}
            <div className="bg-white border rounded p-3 shadow-sm">
              <div className="flex items-center mb-2">
                <img
                  src={post.originalPost.image}
                  alt="Original Profile"
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div>
                  <p className="font-bold text-sm">
                    {post.originalPost.userName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(post.originalPost.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 text-sm">
                {post.originalPost.content}
              </p>
              {post.originalPost.postImage && (
                <img
                  src={post.originalPost.postImage}
                  alt="Original Post"
                  className="mt-2 rounded-lg"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Post;
