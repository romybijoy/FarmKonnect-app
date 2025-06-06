// PostUploadModal.jsx
import React, { useState } from "react";
import { FaImage } from "react-icons/fa";
import { FiSend, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { Firebase } from "../../firebase/config";
import { createPost } from "../../redux/slices/PostSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function PostUploadModal({ isOpen = true, onClose }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const userData = JSON.parse(localStorage.getItem("myInfo"));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const closeModal = () => {
    if (onClose) onClose();
    setText("");
    setImage(null);
    navigate("/home");
  };

  const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const storageRef = Firebase.storage().ref(`/image/${file.name}`);
  
  storageRef
    .put(file)
    .then((snapshot) => {
      return snapshot.ref.getDownloadURL();
    })
    .then((url) => {
      setImage(url);
      console.log("Firebase Image URL:", url);
    })
    .catch((error) => {
      console.error("Error uploading image:", error);
    });
};


  const handlePost = async () => {
  try {
    const result = await dispatch(createPost({ content: text, image: image }));

    if (createPost.fulfilled.match(result)) {
      toast.success("Post Created Successfully");
      navigate("/home");
      closeModal();
    } else {
      toast.error("Failed to create post");
    }
  } catch (error) {
    toast.error("Something went wrong");
  }
};


  return (
    <>
      {/* Modal Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeModal}
        >
          {/* Modal Content */}
          <div
            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FiX size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4">Create a Post</h2>

            {/* User Avatar & Textarea */}
            <div className="flex items-start gap-3 mb-3">
              <img
                src={userData.image}
                alt="Avatar"
                className="w-10 h-10 rounded-full"
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full resize-none border-none outline-none text-gray-700 placeholder-gray-500 bg-gray-100 rounded-lg p-2"
                rows={3}
              />
            </div>

            {/* Preview Image */}
            {image && (
              <div className="mb-3">
                <img
                  src={image}
                  alt="Preview"
                  className="w-full max-w-[350px] rounded-lg object-cover"
                />
              </div>
            )}

            {/* Upload + Post */}
            <div className="flex justify-between items-center mt-4 border-t pt-4">
              <label className="flex items-center gap-2 text-blue-600 cursor-pointer">
                <FaImage />
                <span className="text-sm font-medium">Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              <button
                onClick={handlePost}
                disabled={!text && !image}
                className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
              >
                <FiSend />
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
