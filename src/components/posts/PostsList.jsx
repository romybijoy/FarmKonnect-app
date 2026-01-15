import React from "react";
import NoPosts from "./NoPosts";
import Post from "./Post";

import { useNavigate } from "react-router-dom";
import EmptyFeed from "./EmptyFeed";

/**
 * PostsList
 * ----------
 * Handles UI states:
 * - Loading
 * - Service Down (Error)
 * - Empty Posts
 * - Render Posts
 */
function PostsList({ posts, loading, error, isFeed }) {
  const navigate = useNavigate();
  // 🔄 Loading state
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading posts...</div>
    );
  }

  // Post Service Down / Network Error
  if (error) {
    return (
      <div className="p-4 max-w-screen-md mx-auto text-center mt-10">
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold mb-2">
            Post Service Unavailable
          </h2>
          <p className="text-gray-600">
            We're unable to load posts at the moment. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // No posts (valid state)
  if (!isFeed && (!posts || posts.length === 0)) {
    return <NoPosts />;
  }
  if (isFeed && (!posts || posts.length === 0)) {
    return (
      <EmptyFeed
        onCreatePost={() => navigate("/addPost")}
        onFindPeople={() => navigate("/suggestions")}
      />
    );
  }

  // Render posts
  return (
    <div className="p-4 max-w-screen-md mx-auto">
      {posts?.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}

export default PostsList;
