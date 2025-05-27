import React, { useState } from 'react'
import prof1 from '../assets/prof1.jpeg'
import prof2 from '../assets/prof4.jpeg'
import prof3 from '../assets/prof2.jpeg'
import prof4 from '../assets/prof3.jpeg'
import '../index.css'
function Post() {
    const [posts, setPosts] =useState([
                {
                    id: 1,
                    user: {
                        id: 1,
                        username: "John Doe",
                        img: prof1
                    },
                    img: prof1
                },
                {
                     id: 2,
                    user: {
                        id: 2,
                        username: "Alice Bow",
                        img: prof4
                    },
                    img: prof1
                },
                {
                    id: 3,
                    user: {
                        id: 3,
                        username: "Manoj",
                        img: prof2
                    },
                    img: prof1
                },
                {
                    id: 4,
                    user: {
                        id: 4,
                        username: "Albin Joe",
                        img: prof3
                    },
                    img: prof1
                },
            ]);
  return (
    <div>
      {/* <div className="post-header">
        <img src={prof1} alt="Profile" className="profile-pic" />
        <div className="user-info">
          <h3>John Doe</h3>
          <p>Software Engineer at XYZ</p>
        </div>
      </div>
      <div className="post-content">
        <p>Excited to share my latest project on React!</p> */}
        {/* {media && <img src={media} alt="Post" className="post-image" />} */}
      {/* </div>
      <div className="post-footer">
        <button className="like-btn">Like 120</button>
        <button className="comment-btn">Comment 3</button>
        <button className="share-btn">Share</button>
      </div> */}
{/* 
      import React from "react";
import "./Post.css"; // Add styling in a separate CSS file

const Post = ({ user, content, tags, timestamp, likes, comments, reposts }) => {
  return ( */}
   
        {posts.length > 0 ? (
        posts.map((post) => (
            <div key={post.id} className='mx-1'>
                 <div className="post-container">
      <div className="post-header">
        <img src={post.user.img} alt="Profile" className="profile-picture rounded-circle" />
        <div className="post-info">
          <h6>{post.user.username}</h6>
          <p className='post_desc'>{"gdsgfdg dgghgh"} <br />{"April 2 at 2:13 PM"}</p>
          
        </div>
        <div className='right_icons'>
            <div><i className="bi bi-three-dots mr-5"></i></div>
            <div><i className="bi bi-x"></i></div>
          </div>
      </div>
      <div className="post-content">
        <p>{"Hello"}</p>
      </div>

      <div className="post-counts">
        <div className='w-70'>23 likes</div>
        <div className='w-15'>60 comments</div>
        <div className='w-15'>19 reposts</div>
      </div>
      <hr />
      <div className="post-interactions">
        <div className="like-button"><i className="post_icons bi bi-hand-thumbs-up"></i>Like</div>
        <div className="comment-button"><i className="post_icons bi bi-chat-left-text"></i>Comment</div>
        <div className="repost-button"><i className="post_icons bi bi-arrow-repeat"></i>Repost</div>
        <div className="send-button"><i className="post_icons bi bi-send"></i>Send</div>
      </div>
      </div>
    </div>
        ))
      ): (
        <p>Loading</p>
      )}
    </div>
  )
}

export default Post
