import { useEffect } from "react";
import NoPosts from "./NoPosts";
import Post from "./Post";
import { useDispatch } from "react-redux";
import {
  fetchLikeCount,
  fetchLikeStatus,
  fetchSaveStatus,
  fetchSaveCount,
} from "../../redux/slices/PostSlice";

import { fetchCommentCount } from "../../redux/slices/CommentSlice";

function PostsList({ posts }) {
  if (!posts || posts.length === 0) return <NoPosts />;
  const userData = JSON.parse(localStorage.getItem("myInfo"));
  const dispatch = useDispatch();
  useEffect(() => {
    if (posts?.length > 0) {
      posts.forEach((post) => {
        dispatch(fetchLikeCount(post.id));
        dispatch(fetchLikeStatus({ postId: post.id, userId: userData.id }));
        dispatch(fetchSaveStatus({ postId: post.id, userId: userData.id }));
        dispatch(fetchSaveCount(post.id));
        dispatch(fetchCommentCount(post.id));
      });
    }
  }, [posts, dispatch, userData.id]);

  return (
    <div className="p-4 max-w-screen-md mx-auto">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
export default PostsList;
