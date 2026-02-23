import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  fetchComments,
  addComment,
  resetComments,
} from "../../redux/slices/CommentSlice";
import Comment from "./Comment";

export default function CommentSection({ postId }) {
  const EMPTY_ARRAY = [];
  const dispatch = useDispatch();
  const comments = useSelector(
    (state) => state.comments.commentsByPost[postId]?.items ?? EMPTY_ARRAY,
  );
  const loading = useSelector((state) => state.comments.loading);
  const [newComment, setNewComment] = useState("");
  const userData = JSON.parse(localStorage.getItem("myInfo") || "{}");

  useEffect(() => {
    dispatch(resetComments(postId));
    dispatch(fetchComments({ postId, page: 0 }));
  }, [postId]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    dispatch(
      addComment({
        postId,
        content: newComment.trim(),
      }),
    );

    setNewComment("");
  };

  return (
    <div className="mt-3 sm:mt-4 bg-white rounded-xl border border-gray-200 shadow-sm w-full">
      {/* Add Comment */}
      <div className="flex items-start gap-3 p-3 sm:p-4 border-b">
        <img
          src={userData?.image || "/profile.png"}
          alt="profile"
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border mt-1"
        />

        <div className="flex flex-1 items-center gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            placeholder="Write a comment..."
            className="flex-1 bg-gray-100 px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className={`text-sm font-semibold px-4 py-2 rounded-full transition ${
              newComment.trim()
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Post
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="divide-y">
        {loading ? (
          <p className="p-4 text-sm text-gray-500">Loading comments...</p>
        ) : comments?.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">
            No comments yet. Be the first one!
          </p>
        ) : (
          comments.map((comment) => (
            <Comment key={comment.id} comment={comment} postId={postId} />
          ))
        )}
      </div>
    </div>
  );
}
