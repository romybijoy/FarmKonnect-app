import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Firebase } from "../../firebase/config";
import { useDispatch } from "react-redux";
import { createStory } from "../../redux/slices/StorySlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function AddStory({ onClose }) {
  const [file, setFile] = useState(null);
  const [type, setType] = useState("");
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("myInfo"));

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const fileType = selected.type.startsWith("video") ? "video" : "image";
    setType(fileType);

    if (fileType === "video") {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        if (duration > 15) {
          alert("Please select a video less than or equal to 15 seconds");
          setFile(null);
          return;
        } else {
          setFile(selected);
          setPreview(URL.createObjectURL(selected));
        }
      };
      video.src = URL.createObjectURL(selected);
    } else {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    setUploading(true);
    const storageRef = ref(Firebase.storage(), `/story/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      () => {},
      (error) => {
       toast.error("Upload failed");
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        dispatch(
          createStory({
            type: type,
            userId: userData.id,
            profilePic: userData.profilePic,
            username: userData.username,
            imageUrl: type === "image" ? downloadURL : "",
            videoUrl: type === "video" ? downloadURL : "",
          })
        );

        toast.success("Story uploaded successfully!");
        navigate("/home");
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="relative p-4 max-w-md w-full mx-auto bg-white shadow rounded-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-xl mb-4 font-semibold">Add Story</h2>

        {preview && (
          <div className="mb-4">
            {type === "image" ? (
              <img src={preview} alt="preview" className="w-full rounded" />
            ) : (
              <video controls className="w-full rounded">
                <source src={preview} />
              </video>
            )}
          </div>
        )}

        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="mb-4"
        />

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-[#689F38] text-white px-4 py-2 rounded hover:opacity-90"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

export default AddStory;
