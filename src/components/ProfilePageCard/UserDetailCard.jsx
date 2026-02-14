import React, { useEffect, useRef, useState } from "react";
import { CheckCircle, Pencil, Camera } from "lucide-react";
import EditProfileModal from "./EditProfileModal";
import { fetchFollowCounts } from "../../redux/slices/FollowSlice";
import { useDispatch, useSelector } from "react-redux";
import FollowButton from "../follow/FollowButton";

const UserDetailCard = ({
  user,
  isCurrentUser,
  verifiedEmail,
  openEditModal,
  postsCount,
}) => {
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(user.image);
  const [modalOpen, setModalOpen] = useState(false);
  const dispatch = useDispatch();
  const loggedInUserId = useSelector((state) => state.auth?.userInfo?.userId);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);

    // Pass to parent for upload
    onImageChange && onImageChange(file);
  };

  const { followersCount, followingCount } = useSelector(
    (state) => state.follow
  );

  useEffect(() => {
    if (openEditModal) {
      // Call your function or set state to open modal
      setModalOpen(openEditModal);
    }
  }, [openEditModal]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchFollowCounts(user?.id ? user?.id : user?.userId));
    }
  }, [user?.id, user?.userId, dispatch]);

  useEffect(() => {
    setPreviewImage(user?.imageUrl || user?.image || null);
  }, [user]);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Top Section: Profile + Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="bg-white rounded-2xl p-6 text-center max-w-xl mx-auto">
          {/* Profile Image */}
          <div className="relative mx-auto w-28 h-28">
            <img
              src={previewImage || "/profile.png"}
              className="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover"
              about="profile"
            />
          </div>

          {/* Name & Verified */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <h2 className="text-xl font-semibold text-gray-800">{user?.name}</h2>
            <CheckCircle className="text-[#689F38] w-5 h-5" />
          </div>
          {/* Edit / Follow Button */}
          {isCurrentUser ? (
            <button
              onClick={() => setModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1 border border-gray-300 px-4 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <FollowButton
              viewerId={loggedInUserId}
              targetUserId={user?.id ? user?.id : user?.userId}
            />
          )}

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-4 text-sm text-gray-600">
            <div>
              <span className="font-bold text-gray-800">{postsCount || 0}</span>{" "}
              posts
            </div>
            <div>
              <span className="font-bold text-gray-800">
                {user?.followersCount
                  ? user?.followersCount || 0
                  : followersCount || 0}
              </span>{" "}
              followers
            </div>
            <div>
              <span className="font-bold text-gray-800">
                {user?.followingCount
                  ? user?.followingCount || 0
                  : followingCount || 0}
              </span>{" "}
              following
            </div>
          </div>

          {/* Location */}
          {user.district && (
            <div className="mt-3 text-sm text-gray-700 font-medium">
              {user?.district}
            </div>
          )}

          {/* Bio */}
          <div className="mt-2 text-sm text-gray-600">
            {user?.description || user?.bio ? (
              user?.description ? (
                user?.description
              ) : (
                user?.bio
              )
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
        verifiedEmail={verifiedEmail}
      />
    </div>
  );
};

export default UserDetailCard;
