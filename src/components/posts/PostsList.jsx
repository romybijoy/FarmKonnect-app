import { useEffect,useState } from "react";
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
  
  const userData = JSON.parse(localStorage.getItem("myInfo"));
  const [isFallback, setIsFallback] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!posts) return;

    if (posts.length === 0) {
      // If backend returned empty list → might be fallback due to service down
      setIsFallback(true);
    } else {
      setIsFallback(false);
      posts.forEach((post) => {
        dispatch(fetchLikeCount(post.id));
        dispatch(fetchLikeStatus({ postId: post.id, userId: userData.id }));
        dispatch(fetchSaveStatus({ postId: post.id, userId: userData.id }));
        dispatch(fetchSaveCount(post.id));
        dispatch(fetchCommentCount(post.id));
      });
    }
  }, [posts, dispatch, userData.id]);

  if (isFallback) {
    return (
      <div className="p-4 max-w-screen-md mx-auto text-center mt-10">
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Post Service Unavailable</h2>
          <p className="text-gray-600">
            We're unable to load posts at the moment. Please try again later.
          </p>
        </div>
      </div>
    );
  }

   if (!posts || posts.length === 0) return <NoPosts />;

  return (
    <div className="p-4 max-w-screen-md mx-auto">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
export default PostsList;
