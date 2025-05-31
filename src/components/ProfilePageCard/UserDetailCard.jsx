import React, { useEffect, useState } from "react";
import { TbCircleDashed } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// import { followUserAction, unFollowUserAction } from "../../Redux/User/Action";
import "./UserDetailCard.css";
// import { isReqUser } from '../../Config/Logic'

import prof1 from "../../assets/prof1.jpeg";

import prof2 from "../../assets/prof4.jpeg";

const UserDetailCard = ({ user, isRequser, isFollowing }) => {
  const token = localStorage.getItem("token");
  const { post } = useSelector((store) => store);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isFollow, setIsFollow] = useState(false);

  const goToAccountEdit = () => {
    navigate("/account/edit");
  };

  console.log("user --- ", user);

  const data = {
    jwt: token,
    userId: user?.id,
  };

  const handleFollowUser = () => {
    dispatch(followUserAction(data));
    console.log("follow");
    setIsFollow(true);
  };

  const handleUnFollowUser = () => {
    dispatch(unFollowUserAction(data));
  };

  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        id: 1,
        username: "John Doe",
        img: prof1,
      },
      img: prof2,
    },
  ]);

  useEffect(() => {
    setIsFollow(isFollowing);
  }, [isFollowing]);

  return (
    <div className="py-10">
      <div className="flex items-center">
        <div className="">
          <img
            src={posts[0].user.img}
            alt="Profile"
            className="profile-picture rounded-circle"
          />
        </div>

        <div className="ml-10 space-y-5 text-xs w-[50%] md:w-[60%] lg:w-[80%]">
          <div className=" flex space-x-10 items-center">
            <p className="text-base">{"John Doe"}</p>
            {/* <button className="text-xs py-1 px-5 bg-slate-100 hover:bg-slate-300 rounded-md font-semibold">
              {isRequser ? (
                <span onClick={goToAccountEdit}>Edit profile</span>
              ) : isFollow ? (
                <span onClick={handleUnFollowUser}>Unfollow </span>
              ) : (
                <span onClick={handleFollowUser}>Follow</span>
              )}
            </button>
            <button className="text-xs py-1 px-5 bg-slate-100 hover:bg-slate-300 rounded-md font-semibold">
              {isRequser ? "Add tools" : "Message"}
            </button> */}
            <TbCircleDashed className="text-xl" />
          </div>

          <div className="flex space-x-10">
            <div>
              <span className="font-semibold mr-2">
                {post?.reqUserPost?.length || 0}
              </span>
              <span>posts</span>
            </div>

            <div>
              <span className="font-semibold mr-2">
                {user?.follower?.length}
              </span>
              <span>followers</span>
            </div>
            <div>
              <span className="font-semibold mr-2">
                {user?.following?.length}
              </span>
              <span>following</span>
            </div>
          </div>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="font-thin text-sm">{user?.bio}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailCard;
