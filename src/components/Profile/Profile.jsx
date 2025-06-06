import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import ProfilePostsPart from "../ProfilePageCard/ProfilePostsPart";
import UserDetailCard from "../ProfilePageCard/UserDetailCard";
// import { isFollowing, isReqUser } from '../../Config/Logic'
// import { findByUsernameAction, getUserProfileAction } from '../../Redux/User/Action'

import { showPost } from "../../redux/slices/PostSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const currentUser = JSON.parse(localStorage.getItem("userInfo"));
  const { username } = useParams();
  const { user } = useSelector((store) => store);

  // const isRequser=isReqUser(user.reqUser?.id,user.findByUsername?.id);
  // const isFollowed=isFollowing(user.reqUser,user.findByUsername);
  // console.log(user)

  // const { currentUser } = useSelector((state) => state.app);
 const { posts } = useSelector((state) => state.post);

  useEffect(() => {
    dispatch(showPost());
  }, [dispatch]);
  
  console.log(currentUser);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Left Sidebar / Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-4">
            <UserDetailCard
              user={currentUser}
              isCurrentUser={true} // only show Edit Profile if this is the logged-in user
              onEditProfile={() => console.log("Open edit modal or route")}
              onImageChange={(file) => {
                console.log("Image selected:", file);
                // Upload logic here
              }}
            />
          </div>
        </div>

        {/* Right Content / Posts */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow pt-1">
            <ProfilePostsPart user={currentUser} post={posts}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
