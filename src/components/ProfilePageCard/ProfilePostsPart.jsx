import React, { useEffect, useState } from "react";
import { BsBookmark } from "react-icons/bs";
import { GrTable } from "react-icons/gr";
import { RiVideoFill, RiVideoLine } from "react-icons/ri";
import { BiBookmark, BiUserPin } from "react-icons/bi";
import { AiOutlineTable, AiOutlineUser } from "react-icons/ai";
import ReqUserPostCard from "./ReqUserPostCard";
import { useDispatch, useSelector } from "react-redux";

import prof1 from "../../assets/prof1.jpeg";
import prof2 from "../../assets/prof4.jpeg";
import prof3 from "../../assets/prof2.jpeg";
import prof4 from "../../assets/prof3.jpeg";
// import { reqUserPostAction, savePostAction } from "../../Redux/Post/Action";
// import {reqUserPostAction} from "../../Redux/Post/Action.js"

const ProfilePostsPart = ({ user }) => {
  const [activeTab, setActiveTab] = useState("Post");
  // const { post} = useSelector((store) => store);
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
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
    {
      id: 2,
      user: {
        id: 2,
        username: "John Doe",
        img: prof1,
      },
      img: prof3,
    },
    {
      id: 3,
      user: {
        id: 3,
        username: "John Doe",
        img: prof1,
      },
      img: prof1,
    },
    {
      id: 4,
      user: {
        id: 4,
        username: "John Doe",
        img: prof1,
      },
      img: prof1,
    },
  ]);

  const tabs = [
    {
      tab: "Post",
      icon: <AiOutlineTable className="text-xs" />,
      activeTab: "",
    },
    {
      tab: "Followers",
      icon: <RiVideoLine className="text-xs" />,
      activeTab: "",
    },
    {
      tab: "Following",
      icon: <BiBookmark className="text-xs" />,
      activeTab: "",
    },
    {
      tab: "Groups",
      icon: <AiOutlineUser className="text-xs" />,
      activeTab: "",
    },
  ];

  // useEffect(() => {
  //   const data = {
  //     jwt: token,
  //     userId: user?.id,
  //   };
  //   // dispatch(reqUserPostAction(data));
  // }, [user,post.createdPost]);

  return (
    <div className="">
      <div className="flex space-x-14 border-t relative ">
        {tabs.map((item) => (
          <div
            onClick={() => setActiveTab(item.tab)}
            className={`${
              item.tab === activeTab ? "border-t border-black" : "opacity-60"
            } flex items-center cursor-pointer py-2 text-sm`}
          >
            <p>{item.icon}</p>

            <p className="ml-1 text-xs">{item.tab} </p>
          </div>
        ))}
      </div>
      <div>
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="mx-1">
              <div className="post-container">
                <div className="post-header">
                  <img
                    src={post.user.img}
                    alt="Profile"
                    className="profile-picture rounded-circle"
                  />
                  <div className="post-info">
                    <h6>{post.user.username}</h6>
                    <p className="post_desc">
                      {"gdsgfdg dgghgh"} <br />
                      {"April 2 at 2:13 PM"}
                    </p>
                  </div>
                  <div className="right_icons">
                    <div>
                      <i className="bi bi-three-dots mr-5"></i>
                    </div>
                    <div>
                      <i className="bi bi-x"></i>
                    </div>
                  </div>
                </div>
                <div className="post-content">
                  <p>{"Hello"}</p>
                </div>

                <div className="post-counts">
                  <div className="w-70">23 likes</div>
                  <div className="w-15">60 comments</div>
                  <div className="w-15">19 reposts</div>
                </div>
                <hr />
                <div className="post-interactions">
                  <div className="like-button">
                    <i className="post_icons bi bi-hand-thumbs-up"></i>Like
                  </div>
                  <div className="comment-button">
                    <i className="post_icons bi bi-chat-left-text"></i>Comment
                  </div>
                  <div className="repost-button">
                    <i className="post_icons bi bi-arrow-repeat"></i>Repost
                  </div>
                  <div className="send-button">
                    <i className="post_icons bi bi-send"></i>Send
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Loading</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePostsPart;
