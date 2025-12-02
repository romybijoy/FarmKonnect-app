// Post.jsx (updated)
import React, { useEffect, useRef, useState } from "react";
import "../../index.css";
import NoPosts from "./NoPosts";
import { parseISO, format } from "date-fns";
import {
  likePost,
  toggleSavePost,
  repostPost,
  hidePost,
  reportPost, // <- import the thunk from your slice
} from "../../redux/slices/PostSlice";
import { useDispatch, useSelector } from "react-redux";
import { FaShare } from "react-icons/fa";
import CommentSection from "./CommentSection";

import { toast } from "react-toastify";

function Post({ post }) {
  const [expandedPosts, setExpandedPosts] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState({});
  const dispatch = useDispatch();
  const [dropdownPostId, setDropdownPostId] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Report modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(false);

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

  function formatDate(dateString) {
    const cleanDateString = dateString.split(".")[0];
    const parsedDate = parseISO(cleanDateString);
    return format(parsedDate, "dd MMM yyyy, hh:mm a");
  }

  const isExpanded = expandedPosts[post.id];

  const content = post.repost
    ? post.originalPost?.content || ""
    : post.content || "";
  const previewText = content.slice(0, 70);

  const images =
    Array.isArray(post.postImages) && post.postImages.length > 0
      ? post.postImages
      : post.postImage
      ? [post.postImage]
      : [];

  // ---------- Report submission handler ----------
  const openReportModal = () => {
    setReportModalOpen(true);
    setReportError(null);
    setReportSuccess(false);
    setReportReason("spam");
    setReportDetails("");
  };

  const submitReport = async () => {
    setReportError(null);
    setReportSubmitting(true);
    try {
      // dispatch the redux thunk
      await dispatch(
        reportPost({
          postId: post.id,
          reporterId: userData.id,
          reason: reportReason,
          details: reportDetails || null,
        })
      ).unwrap(); // unwrap to catch rejection here

      setReportSuccess(true);
      setReportModalOpen(false);

       toast.success("Report Submitted Successfully");
    } catch (err) {
      // err may be a string or Error
      setReportError(err?.message || "Failed to submit report");
      toast.error("Failed to submit report");
    } finally {
      setReportSubmitting(false);
    }
  };

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
              <div className="absolute right-0 mt-2 w-44 bg-white rounded shadow-md z-10 transition-all duration-200 ease-in-out animate-fadeIn">
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
                      dispatch(hidePost({ postId: post.id, userId: userData.id }))
                    }
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Remove from Feed
                  </li>

                  {/* REPORT option */}
                  <li
                    onClick={() => {
                      setDropdownPostId(null);
                      openReportModal();
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
                  >
                    Report Post
                  </li>
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

          {/* --- Images grid --- (unchanged) */}
          {images.length > 0 && (
            <>
              <div
                className="mt-3 grid gap-1"
                style={{
                  gridTemplateColumns:
                    images.length === 1
                      ? "1fr"
                      : images.length === 2
                      ? "1fr 1fr"
                      : "1fr 1fr",
                }}
              >
                {images.slice(0, 3).map((url, idx) => {
                  const isThreeAndFirst = images.length === 3 && idx === 0;
                  return (
                    <div
                      key={idx}
                      className={`relative overflow-hidden rounded-lg bg-gray-100 ${
                        isThreeAndFirst ? "row-span-2" : ""
                      }`}
                      style={{
                        cursor: "pointer",
                        minHeight: isThreeAndFirst ? 220 : 120,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onClick={() => {
                        setLightboxIndex(idx);
                        setLightboxOpen(true);
                      }}
                    >
                      <img
                        src={url}
                        alt={`post-${idx}`}
                        className="w-full h-full object-cover"
                        style={{ display: "block" }}
                      />

                      {idx === 2 && images.length > 3 && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white text-xl font-semibold">
                          +{images.length - 3}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {lightboxOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                  <button
                    className="absolute top-5 right-5 text-white text-2xl p-2"
                    onClick={() => setLightboxOpen(false)}
                    aria-label="Close"
                  >
                    &times;
                  </button>

                  <button
                    className="absolute left-4 text-white text-3xl p-2"
                    onClick={() =>
                      setLightboxIndex(
                        (i) => (i - 1 + images.length) % images.length
                      )
                    }
                    aria-label="Prev"
                  >
                    ‹
                  </button>

                  <div className="max-w-[90vw] max-h-[90vh]">
                    <img
                      src={images[lightboxIndex]}
                      alt={`lightbox-${lightboxIndex}`}
                      className="max-w-full max-h-[80vh] object-contain rounded"
                    />
                    <div className="text-center text-white mt-2">
                      {lightboxIndex + 1} / {images.length}
                    </div>
                  </div>

                  <button
                    className="absolute right-4 text-white text-3xl p-2"
                    onClick={() =>
                      setLightboxIndex((i) => (i + 1) % images.length)
                    }
                    aria-label="Next"
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-between text-sm text-gray-600 mt-4">
          <div>
            <div>
              {likeCount ?? 0} {likeCount === 1 ? "like" : "likes"}
            </div>
          </div>
          <div>{commentCount} comments</div>
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

        {/* --- Repost View --- (unchanged) */}
        {post.repost && post.originalPostId && (
          <div className="border border-gray-200 rounded-lg bg-gray-50 mt-4 p-3">
            <div className="text-sm text-gray-500 mb-2">
              <span className="font-semibold">{post.userName}</span> shared this
              post
            </div>

            <div className="bg-white border rounded p-3 shadow-sm">
              <div className="flex items-center mb-2">
                <img
                  src={post?.originalPost?.image}
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

      {/* ---------------- REPORT MODAL ---------------- */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-full max-w-md p-5 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Report Post</h3>
              <button onClick={() => setReportModalOpen(false)}>&times;</button>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              Why are you reporting this post? Select a reason and optionally add
              details.
            </p>

            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full border rounded p-2 mb-3"
            >
              <option value="spam">Spam or misleading</option>
              <option value="harassment">Harassment or hate speech</option>
              <option value="nudity">Nudity or sexual content</option>
              <option value="violence">Violence or dangerous acts</option>
              <option value="other">Other</option>
            </select>

            <textarea
              placeholder="More details (optional)"
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              className="w-full border rounded p-2 mb-3 min-h-[80px]"
            />

            {reportError && (
              <div className="text-red-600 text-sm mb-2">{reportError}</div>
            )}

            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 rounded hover:bg-gray-100"
                onClick={() => setReportModalOpen(false)}
                disabled={reportSubmitting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1 rounded bg-red-600 text-white disabled:opacity-60"
                onClick={submitReport}
                disabled={reportSubmitting}
              >
                {reportSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Post;
