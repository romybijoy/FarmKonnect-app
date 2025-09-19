import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSavedPosts } from "../../redux/slices/PostSlice";
import PostsList from "./PostsList";

const SavedPosts = ({user}) => {
   const dispatch = useDispatch();
  const { savedPosts, savedPostsLoading, savedPostsError } = useSelector((state) => state.post);

  const userId = JSON.parse(localStorage.getItem("myInfo")).id;

  useEffect(() => {
    dispatch(getSavedPosts({ userId }));
  }, [dispatch, userId]);

  if (savedPostsLoading) return <div className="text-center py-6">Loading saved posts...</div>;
  if (savedPostsError) return <div className="text-center text-red-500">{savedPostsError}</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {savedPosts.length > 0 ? (
        <PostsList posts={savedPosts} />
      ) : (
        <div className="text-center text-gray-500">No saved posts yet</div>
      )}
    </div>
  );
};

export default SavedPosts;
