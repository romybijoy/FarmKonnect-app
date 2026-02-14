// Post.jsx (updated)
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { parseISO, format } from "date-fns";
import { FaShare } from "react-icons/fa";

import { Firebase } from "../../firebase/config";
import {
  likePost,
  toggleSavePost,
  repostPost,
  hidePost,
  reportPost,
  fetchLikeCount,
  fetchLikeStatus,
  fetchSaveStatus,
  fetchSaveCount,
  updatePost,
  deletePost,
} from "../../redux/slices/PostSlice";
import { fetchCommentCount } from "../../redux/slices/CommentSlice";
import CommentSection from "./CommentSection";

import { toast } from "react-toastify";
import {
  Modal,
  Form,
  Button,
  Row,
  Col,
  Image as RBImage,
  Spinner,
} from "react-bootstrap";
import ImageCropper from "../ImageUpload/ImageCropper";
import ExistingImagesGrid from "./ExistingImagesGrid";
import PostImagesGrid from "./PostImagesGrid";

function Post({ post }) {
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);

  const userId = useSelector((state) => state.auth?.userInfo?.userId);
  const isOwner = post.userId === userId;
  const userData = useSelector((state) => state.auth?.userInfo || {});
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

  const [expandedPosts, setExpandedPosts] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [dropdownPostId, setDropdownPostId] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editContent, setEditContent] = useState(post.content || "");
  const [existingImages, setExistingImages] = useState(post.postImages || []);
  const [newImageUrls, setNewImageUrls] = useState([]); // uploaded URLs
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [editImages, setEditImages] = useState(post.postImages || []);
  const [editLoading, setEditLoading] = useState(false);
  const [currentCropImage, setCurrentCropImage] = useState(null); // string (URL)
  const [selectedFiles, setSelectedFiles] = useState([]); // { name, dataUrl }
  const [imgAfterCrop, setImgAfterCrop] = useState([]); // previews
  const commentCount = useSelector(
    (state) => state.comments.counts[post.id] || 0,
  );

  const likeData = useSelector((state) => state.post.likesByPostId[post?.id]);
  const saveData = useSelector((state) => state.post.savedByPostId[post?.id]);

  const isLiked = likeData?.liked || false;
  const likeCount = likeData?.likeCount || 0;
  const isSaved = saveData?.saved || false;
  const saveCount = saveData?.count || 0;

  const inputRef = useRef(null);

  const handleToggleMore = (postId) => {
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleSave = () => {
    console.log("first");
    dispatch(toggleSavePost({ postId: post.id, userId: userId }));
  };

  const handleDropdownToggle = (id) => {
    setDropdownOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ---------- Fetch metadata ----------
  useEffect(() => {
    if (!post?.id || !userId) return;

    dispatch(fetchLikeCount(post.id));
    dispatch(fetchLikeStatus({ postId: post.id, userId }));
    dispatch(fetchSaveStatus({ postId: post.id, userId }));
    dispatch(fetchSaveCount(post.id));
    dispatch(fetchCommentCount(post.id));
  }, [dispatch, post.id, userId]);

  // ---------- Helpers ----------
  const formatDate = (dateString) => {
    const parsed = parseISO(dateString.split(".")[0]);
    return format(parsed, "dd MMM yyyy, hh:mm a");
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

  useEffect(() => {
    if (selectedFiles.length > 0 && selectedFiles[currentIndex]) {
      setCurrentCropImage(selectedFiles[currentIndex].dataUrl);
    } else {
      setCurrentCropImage(null);
    }
  }, [selectedFiles, currentIndex]);

  useEffect(() => {
    if (editOpen) {
      setEditContent(post.content || "");
      setExistingImages(post.postImages || []);
      setSelectedFiles([]);
      setNewImageUrls([]);
      setCurrentCropImage(null);
    }
  }, [editOpen, post]);

  const content = post.content || "";
  const previewText = content.slice(0, 100);

  const images =
    Array.isArray(post.postImages) && post.postImages.length > 0
      ? post.postImages
      : post.postImage
        ? [post.postImage]
        : [];

  // ---------- Actions ----------
  const handleLike = () => dispatch(likePost({ postId: post.id, userId }));

  const handleRepost = () =>
    dispatch(
      repostPost({
        postId: post.id,
        userId,
        userDto: {
          name: userData.name,
          profileImage: userData.profileImage || null,
        },
      }),
    );

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
          reporterId: userId,
          reason: reportReason,
          details: reportDetails || null,
        }),
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

  const handleEditSubmit = async () => {
    try {
      setEditLoading(true);

      const finalImages = [...existingImages, ...newImageUrls].slice(
        0,
        MAX_IMAGES,
      );

      await dispatch(
        updatePost({
          postId: post.id,
          userId,
          content: editContent,
          postImages: finalImages,
        }),
      ).unwrap();

      setEditOpen(false);
    } catch (err) {
      console.error("Edit post failed", err);
    } finally {
      setEditLoading(false);
    }
  };

  const MAX_IMAGES = 3;

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const available = Math.max(
      0,
      MAX_IMAGES -
        existingImages.length -
        newImageUrls.length -
        selectedFiles.length,
    );

    if (available <= 0) {
      toast.warn("You can only upload up to 3 images");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const toTake = files.slice(0, available);

    const readers = toTake.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve({
            name: file.name,
            dataUrl: reader.result,
            file,
          });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers)
      .then((results) => {
        setSelectedFiles((prev) => {
          const next = [...prev, ...results];

          //   start cropping immediately if nothing was queued before
          if (prev.length === 0 && results.length > 0) {
            setCurrentIndex(0);
          }

          return next;
        });
      })
      .catch(() => toast.error("Failed to read selected files"))
      .finally(() => {
        if (inputRef.current) inputRef.current.value = "";
      });
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCropDone = async (imgCroppedArea) => {
    const fileObj = selectedFiles[currentIndex];
    if (!fileObj || !imgCroppedArea) return;

    setUploading(true);

    try {
      const img = await createImage(fileObj.dataUrl);

      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;

      let px;
      if (imgCroppedArea.width <= 1 && imgCroppedArea.height <= 1) {
        px = {
          x: Math.round(imgCroppedArea.x * naturalW),
          y: Math.round(imgCroppedArea.y * naturalH),
          width: Math.round(imgCroppedArea.width * naturalW),
          height: Math.round(imgCroppedArea.height * naturalH),
        };
      } else {
        px = {
          x: Math.round(imgCroppedArea.x),
          y: Math.round(imgCroppedArea.y),
          width: Math.round(imgCroppedArea.width),
          height: Math.round(imgCroppedArea.height),
        };
      }

      const canvas = document.createElement("canvas");
      canvas.width = px.width;
      canvas.height = px.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        img,
        px.x,
        px.y,
        px.width,
        px.height,
        0,
        0,
        px.width,
        px.height,
      );

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

      // preview (optional but good UX)
      setImgAfterCrop((prev) => [...prev, dataUrl]);

      // upload to Firebase
      const base64 = dataUrl.split(",")[1];
      const path = `/post/${Date.now()}_${fileObj.name}`;
      const storageRef = Firebase.storage().ref(path);
      const snap = await storageRef.putString(base64, "base64", {
        contentType: "image/jpeg",
      });
      const url = await snap.ref.getDownloadURL();

      // KEY CHANGE FOR EDIT POST
      setNewImageUrls((prev) => {
        const next = [...prev, url];
        return next.slice(0, MAX_IMAGES - existingImages.length);
      });

      // move queue forward
      const nextIndex = currentIndex + 1;
      if (nextIndex < selectedFiles.length) {
        setCurrentIndex(nextIndex);
      } else {
        setSelectedFiles([]);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error("crop/upload error", err);
      toast.error("Failed to crop/upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => {
    setSelectedFiles((prev) => prev.slice(1));
    setCurrentCropImage(null);
  };

  const createImage = (src) =>
    new Promise((resolve, reject) => {
      try {
        const img = new window.Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
      } catch (err) {
        reject(err);
      }
    });

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      {/* ---------- Header ---------- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={post.image || "/profile.png"}
            alt="profile"
            className="w-9 h-9 rounded-full mr-2"
          />

          <div className="pt-2">
            <p className="font-semibold text-sm text-gray-900 m-0">
              {post.userName}
            </p>
            <p className="text-xs text-gray-500 ml-0 mt-1">
              {post.createdAt == null
                ? formatDate(post.repostedAt)
                : formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        {/* ---------- Dropdown ---------- */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() =>
              setDropdownPostId((prev) => (prev === post.id ? null : post.id))
            }
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <i className="bi bi-three-dots"></i>
          </button>

          {dropdownPostId === post.id && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-20">
              <ul className="text-sm divide-y">
                {!isOwner && (
                  <>
                    <li
                      onClick={() =>
                        dispatch(
                          toggleSavePost({
                            postId: post.id,
                            userId: userData.id,
                          }),
                        )
                      }
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {isSaved ? "Unsave Post" : "Save Post"}
                    </li>
                    <li
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() =>
                        dispatch(hidePost({ postId: post.id, userId }))
                      }
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
                  </>
                )}

                {isOwner && (
                  <>
                    <li
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => setEditOpen(true)}
                    >
                      Edit Post
                    </li>

                    <li
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
                      onClick={() =>
                        dispatch(deletePost({ postId: post.id, userId }))
                      }
                    >
                      Delete Post
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Content ---------- */}
      <div className="mt-3 text-sm text-gray-700">
        {expanded ? content : previewText}
        {content.length > 100 && (
          <button
            className="ml-2 text-blue-500 text-xs"
            onClick={() => setExpanded((p) => !p)}
          >
            {expanded ? "Less" : "More"}
          </button>
        )}
      </div>
      {/* ---------------- Images ---------------- */}
      {images.length > 0 && <PostImagesGrid images={images} />}

      {/* ---------- Stats ---------- */}
      <div className="flex justify-between text-xs text-gray-500 mt-3">
        <span>{likeCount} likes</span>
        <span>{commentCount} comments</span>
        <span>
          {saveCount ?? 0} {saveCount === 1 ? "save" : "saves"}
        </span>
      </div>

      <hr className="my-3" />

      {/* ---------- Actions ---------- */}
      <div className="flex justify-between text-sm font-medium">
        <button
          onClick={() =>
            dispatch(likePost({ postId: post.id, userId: userId }))
          }
          className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded"
        >
          <i
            className={`bi ${
              isLiked
                ? "bi-hand-thumbs-up-fill text-blue-600"
                : "bi-hand-thumbs-up"
            }`}
          />
          Like
        </button>

        <button
          onClick={() => setShowComments((p) => !p)}
          className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded"
        >
          <i className="bi bi-chat-left-text" />
          Comment
        </button>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded"
        >
          <i className={`bi ${isSaved ? "bi-bookmark-fill" : "bi-bookmark"}`} />
          Save
        </button>

        <button
          onClick={handleRepost}
          className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded"
        >
          <FaShare />
          Share
        </button>
      </div>

      {/* ---------- Comments ---------- */}
      {showComments && <CommentSection postId={post.id} />}

      {/* --- Repost View ---  */}
      {post.repost && post.originalPostId && (
        <div className="border border-gray-200 rounded-lg bg-gray-50 mt-4 p-3">
          <div className="text-sm text-gray-500 mb-2">
            <span className="font-semibold">{post?.userName}</span> shared this
            post
          </div>

          <div className="bg-white border rounded p-3 shadow-sm">
            <div className="flex items-center">
              <img
                src={post?.originalPost?.image}
                alt="profile"
                className="w-9 h-9 rounded-full mr-2"
              />

              <div className="pt-2">
                <p className="font-semibold text-sm text-gray-900 m-0">
                  {post.originalPost?.userName}
                </p>
                <p className="text-xs text-gray-500 ml-0 mt-1">
                  {post.originalPost?.createdAt &&
                    formatDate(post?.originalPost?.createdAt)}
                </p>
              </div>
            </div>
            <p className="text-gray-700 text-sm">
              {post.originalPost?.content}
            </p>
            {post.originalPost?.postImages?.length > 0 && (
              <PostImagesGrid images={post.originalPost?.postImages} />
            )}
          </div>
        </div>
      )}

      {/* ---------------- REPORT MODAL ---------------- */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-full max-w-md p-5 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Report Post</h3>
              <button onClick={() => setReportModalOpen(false)}>&times;</button>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              Why are you reporting this post? Select a reason and optionally
              add details.
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

      {/* ---------------- EDIT POST MODAL ---------------- */}
      <Modal
        show={editOpen}
        onHide={() => setEditOpen(false)}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Post</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Control
              as="textarea"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
            />
            {/* Existing images */}
            {existingImages.length > 0 && (
              <ExistingImagesGrid
                images={existingImages}
                onRemove={handleRemoveExistingImage}
              />
            )}

            {newImageUrls.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {newImageUrls.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      alt="new-upload"
                      className="w-24 h-24 object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            )}
            {/* New images */}
            <Form.Control
              type="file"
              multiple
              ref={inputRef}
              onChange={handleNewImages}
            />
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleEditSubmit}
            disabled={uploading}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Cropper */}
      {currentCropImage && (
        <ImageCropper
          image={currentCropImage}
          visible={!!currentCropImage}
          onCropDone={handleCropDone}
          onCropCancel={handleCropCancel}
        />
      )}
    </div>
  );
}

export default React.memo(Post);
