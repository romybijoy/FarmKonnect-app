import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL, getStorage } from "firebase/storage";
import { Firebase } from "../../firebase/config"; // Firebase config
import { useDispatch } from "react-redux";
import { createStory } from "../../redux/slices/StorySlice";
import { useNavigate } from "react-router-dom";

function AddStory() {
  const [file, setFile] = useState(null);
  const [type, setType] = useState('');
  const [preview, setPreview] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("myInfo"));

  const handleImageChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const fileType = selected.type.startsWith("video") ? "video" : "image";
    setType(fileType);

    Firebase.storage()
      .ref(`/story/${selected.name}`)
      .put(selected)
      .then(({ ref }) => {
        ref.getDownloadURL().then((url) => {
          setFile(url);
        });
      });
  };

  const handleUpload = () => {
    if (!file) {
      console.error("No file selected");
      return;
    }

    dispatch(createStory({
      type: type,
      email: userData.email,
      profilePic: userData.profilePic,
      username: userData.username,
      imageUrl: type === "image" ? file : "",
      videoUrl: type === "video" ? file : "",
    }));

    navigate("/home");
  };

  const handleClose = () => {
    navigate("/home");
  };

  return (
    <div className="relative p-6 max-w-md mx-auto mt-10 bg-white rounded shadow">
      <button 
        onClick={handleClose} 
        className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-xl font-bold"
        title="Close"
      >
        &times;
      </button>

      <h2 className="text-xl font-semibold mb-4">Add Story</h2>

      {file && (
        <div className="mb-4">
          {type === "image" ? (
            <img src={file} alt="preview" className="w-full rounded" />
          ) : (
            <video controls className="w-full rounded">
              <source src={file} />
            </video>
          )}
        </div>
      )}

      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleImageChange}
      />

      <button
        onClick={handleUpload}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Upload
      </button>
    </div>
  );
}

export default AddStory;
