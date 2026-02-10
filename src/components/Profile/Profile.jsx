import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";

import ProfilePostsPart from "../ProfilePageCard/ProfilePostsPart";
import UserDetailCard from "../ProfilePageCard/UserDetailCard";

import { showPost } from "../../redux/slices/PostSlice";
import { getUserByUsername, fetchUserById } from "../../redux/slices/UserSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const { username } = useParams();
  const location = useLocation();

  /* =========================
     REDUX STATE
  ========================== */
  const loggedInUser = useSelector((state) => state.auth?.userInfo);
  const { user } = useSelector((state) => state.app);
  const profileUser = useSelector((state) => state.app?.profileUser);
  const { profilePosts, count } = useSelector((state) => state.post);

  /* =========================
     ROUTE STATE
  ========================== */
  const verifiedEmail = location.state?.verifiedEmail;
  const openEditModal = location.state?.openEditModal;

  /* =========================
     LOGIC
  ========================== */
  // If username param not present OR username matches logged-in user → own profile
  const isOwnProfile = !username || username === user?.name;

  // Decide which user object to render
  const userToShow = isOwnProfile ? user : profileUser;

  
  /* =========================
     FETCH USER PROFILE
  ========================== */
  useEffect(() => {
    if (!isOwnProfile && username) {
      dispatch(getUserByUsername(username));
    } else if (isOwnProfile && loggedInUser?.userId) {
      dispatch(fetchUserById(loggedInUser.userId));
    }
  }, [username, isOwnProfile, dispatch, loggedInUser?.userId]);

  /* =========================
     FETCH POSTS
  ========================== */

  useEffect(() => {
    if (userToShow?.id || userToShow?.userId) {
      dispatch(showPost(userToShow.id ? userToShow.id : userToShow.userId));
    }
  }, [userToShow?.id, dispatch]);

  /* =========================
     LOADING GUARD
  ========================== */
  if (!userToShow) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading profile...
      </div>
    );
  }

  /* =========================
     RENDER
  ========================== */
  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 
                 h-screen overflow-y-auto scrollbar-hide"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT: USER DETAILS */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-4">
            <UserDetailCard
              user={userToShow}
              isCurrentUser={isOwnProfile}
              verifiedEmail={verifiedEmail}
              openEditModal={openEditModal}
              postsCount={count || 0}
            />
          </div>
        </div>

        {/* RIGHT: POSTS */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow pt-1">
            <ProfilePostsPart user={userToShow} post={profilePosts} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
