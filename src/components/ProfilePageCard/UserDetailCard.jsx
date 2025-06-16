import React, { useRef, useState } from "react";
import { CheckCircle, Pencil, Camera } from "lucide-react";
import EditProfileModal from "./EditProfileModal";

const UserDetailCard = ({
  user,
  isCurrentUser,
  // onEditProfile,
  // onImageChange,
}) => {
  // const user = {
  //   username: "john_doe",
  //   name: "John Doe",
  //   bio: "Photographer | Travel Lover 🌍📸",
  //   profileImage: "https://i.pravatar.cc/300",
  //   postsCount: 132,
  //   followers: 2890,
  //   following: 322,
  // };

  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(user.image);
  const [modalOpen, setModalOpen] = useState(false);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);

    // Pass to parent for upload
    onImageChange && onImageChange(file);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Top Section: Profile + Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="bg-white rounded-2xl p-6 text-center max-w-xl mx-auto">
          {/* Profile Image */}
          <div className="relative mx-auto w-28 h-28">
            <img
              src={user.image || "/default-avatar.png"}
              className="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover"
              alt="Profile"
            />
          </div>

          {/* Name & Verified */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
            <CheckCircle className="text-blue-500 w-5 h-5" />
          </div>

          {/* Edit Button */}
          {isCurrentUser && (
            <button
              onClick={() => setModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1 border border-gray-300 px-4 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </button>
          )}

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-4 text-sm text-gray-600">
            <div>
              <span className="font-bold text-gray-800">
                {user.postsCount || 0}
              </span>{" "}
              posts
            </div>
            <div>
              <span className="font-bold text-gray-800">
                {user.followers || 0}
              </span>{" "}
              followers
            </div>
            <div>
              <span className="font-bold text-gray-800">
                {user.following || 0}
              </span>{" "}
              following
            </div>
          </div>

          {/* Location */}
          {user.district && (
            <div className="mt-3 text-sm text-gray-700 font-medium">
              {user.district}
            </div>
          )}

          {/* Bio */}
          <div className="mt-2 text-sm text-gray-600">
            {user.description ? (
              user.description
            ) : (
              <span className="italic text-gray-400">
                Your bio goes here...
              </span>
            )}
          </div>
        </div>
      </div>

      <EditProfileModal
        show={modalOpen}
        handleClose={() => setModalOpen(false)}
        user={user}
      />
    </div>
  );
};

export default UserDetailCard;
