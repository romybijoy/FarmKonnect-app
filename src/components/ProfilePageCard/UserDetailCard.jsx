import React, { useRef, useState } from "react";
import { CheckCircle, Pencil, Camera } from "lucide-react";
import EditProfileModal from "./EditProfileModal";

const UserDetailCard = ({
  user,
  isCurrentUser,
  onEditProfile,
  onImageChange,
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
  const [previewImage, setPreviewImage] = useState(user.profileImage);
  const [modalOpen, setModalOpen] = useState(false);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);

    // Pass to parent for upload
    onImageChange && onImageChange(file);
  };

  console.log(user)

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Top Section: Profile + Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        {/* Profile Image */}
        {/* Profile Image with Upload Overlay */}
        <div className="relative w-fit mx-auto sm:mx-0">
          <div className="bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-1 rounded-full">
            <img
              src={user?.image || "/default-avatar.png"}
              // alt="Profile"
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white"
            />
          </div>

          {isCurrentUser && (
            <>
              <div
                className="absolute bottom-1 right-1 bg-black bg-opacity-60 p-1.5 rounded-full cursor-pointer hover:bg-opacity-80 transition"
                onClick={() => fileInputRef.current.click()}
              >
                <Camera className="w-4 h-4 text-white" />
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </>
          )}
        </div>

        {/* User Info & Stats */}
        <div className="flex-1">
          {/* Username & Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-4">
            <div className="flex items-center gap-2 text-xl font-semibold text-gray-800">
              {user?.name}

              <CheckCircle className="text-blue-500 w-5 h-5" />
            </div>
            <div className="flex gap-2">
              {isCurrentUser ? (
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-1 border border-gray-300 px-4 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button className="bg-blue-500 text-white px-4 py-1.5 text-sm rounded-lg font-medium hover:bg-blue-600 transition">
                    Follow
                  </button>
                  <button className="border border-gray-300 px-4 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition">
                    Message
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-sm sm:text-base">
            <div>
              <span className="font-semibold">{23 || 0}</span>{" "}
              posts
            </div>
            <div>
              <span className="font-semibold">{4 || 0}</span>{" "}
              followers
            </div>
            <div>
              <span className="font-semibold">{23 || 0}</span>{" "}
              following
            </div>
          </div>

          {/* Name & Bio */}
          <div className="mt-4">
            <p className="font-medium">{user.name}</p>
            {user?. description ? (<p className="text-sm text-gray-700">
              {user.description }</p>) : <p>"Your bio goes here..."</p>
            }
          </div>
        </div>
      </div>

      <EditProfileModal
        show={modalOpen}
        handleClose={() => setModalOpen(false)}
        user={user}
        // onSave={handleSave}
      />
    </div>
  );
};

export default UserDetailCard;

// import React from "react";
// import { CheckCircle, Pencil } from "lucide-react"; // Pencil icon for edit

// const UserDetailCard = ({ isCurrentUser, onEditProfile }) => { */}

//   return (
//     <div className="bg-white rounded-3xl shadow-lg p-6 transition hover:shadow-2xl duration-300">
//       <div className="flex flex-col sm:flex-row sm:items-start sm:gap-10 gap-6">
//         {/* Profile Picture with gradient border */}
//         <div className="flex justify-center sm:block">
//           <div className="bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-1 rounded-full">
//             <img
//               src={user.profileImage || "/default-avatar.png"}
//               alt="Profile"
//               className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white"
//             />
//           </div>
//         </div>

//         {/* Profile Info */}
//         <div className="flex-1">
//           {/* Username + Buttons */}
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
//             <div className="flex items-center gap-2 text-xl font-semibold text-gray-800">
//               {user.username}
//               {user.verified && <CheckCircle className="text-blue-500 w-5 h-5" />}
//             </div>

//             <div className="flex gap-2">
//               {isCurrentUser ? (
//                 <button
//                   onClick={onEditProfile}
//                   className="flex items-center gap-1 border border-gray-300 px-4 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition"
//                 >
//                   <Pencil className="w-4 h-4" />
//                   Edit Profile
//                 </button>
//               ) : (
//                 <>
//                   <button className="bg-blue-500 text-white px-4 py-1.5 text-sm rounded-lg font-medium hover:bg-blue-600 transition">
//                     Follow
//                   </button>
//                   <button className="border border-gray-300 px-4 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition">
//                     Message
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Stats */}
//           <div className="flex gap-8 text-sm sm:text-base text-gray-700 mb-3">
//             <div>
//               <span className="font-bold">{user.postsCount || 0}</span> posts
//             </div>
//             <div>
//               <span className="font-bold">{user.followers || 0}</span> followers
//             </div>
//             <div>
//               <span className="font-bold">{user.following || 0}</span> following
//             </div>
//           </div>

//           {/* Name & Bio */}
//           <div>
//             <p className="font-semibold text-gray-900">{user.name}</p>
//             <p className="text-sm text-gray-600 whitespace-pre-line mt-1">
//               {user.bio || "Tell the world about yourself 🌎"}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserDetailCard; */}
