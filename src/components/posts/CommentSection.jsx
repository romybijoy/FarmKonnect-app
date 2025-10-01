// CommentSection.jsx
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchComments, addComment } from "../../redux/slices/CommentSlice";

export default function CommentSection({ postId }) {
  const dispatch = useDispatch();
  const { items: comments } = useSelector((state) => state.comments);
  const [newComment, setNewComment] = useState("");

  const userData = JSON.parse(localStorage.getItem("myInfo"));

  useEffect(() => {
    dispatch(fetchComments(postId));
  }, [dispatch, postId]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      dispatch(
        addComment({ postId, userId: userData.id, content: newComment })
      );
      setNewComment("");
    }
  };

  return (
    <div className="mt-4 bg-white rounded-lg border border-gray-200">
      {/* Add Comment Box */}
      <div className="flex items-center gap-2 p-3 border-b">
        <img
          src={userData?.image || "profile.png"}
          alt="profile"
          className="w-9 h-9 rounded-full object-cover"
        />
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="border p-2 flex-1 rounded-full text-sm"
        />
        <button
          onClick={handleAddComment}
          className="ml-2 text-blue-600 font-semibold"
        >
          Comment
        </button>
      </div>

      {/* Comment List */}
      <div className="divide-y">
        {comments.map((c) => (
          <Comment key={c.id} comment={c} postId={postId} />
        ))}
      </div>
    </div>
  );
}

function Comment({ comment, postId }) {
  const dispatch = useDispatch();
  const [reply, setReply] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const userData = JSON.parse(localStorage.getItem("myInfo"));

  const handleReply = () => {
    if (reply.trim()) {
      dispatch(
        addComment({
          postId,
          userId: userData.id,
          content: reply,
          parentId: comment.id,
        })
      );
      setReply("");
      setShowReplyBox(false);
    }
  };

  return (
    <div className="p-3">
      {/* Main Comment */}
      <div className="flex items-start gap-3">
        <img
          src={comment?.profileImage || "profile.png"}
          alt=""
          className="w-9 h-9 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="bg-gray-100 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{comment.userName}</span>
              <span className="text-gray-500 text-xs">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm mt-1">{comment.content}</p>
          </div>
          {/* Actions */}
          <div className="flex gap-4 text-xs text-gray-600 mt-1 ml-1">
            {/* <button className="hover:underline">Like</button> */}
            <button onClick={() => setShowReplyBox(!showReplyBox)}>
              Reply
            </button>
          </div>

          {/* Reply Box */}
          {showReplyBox && (
            <div className="flex items-center gap-2 mt-2 ml-6">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a reply..."
                className="border p-1 flex-1 rounded-full text-sm"
              />
              <button
                onClick={handleReply}
                className="text-blue-600 font-semibold text-xs"
              >
                Reply
              </button>
            </div>
          )}

          {/* Replies */}
          {comment.replies?.map((r) => (
            <div key={r.id} className="flex items-start gap-2 mt-3 ml-6">
              <img
                src={r.user?.profileImage || "profile.png"}
                alt=""
                className="w-7 h-7 rounded-full object-cover"
              />
              <div className="bg-gray-100 rounded-lg p-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{r.user?.name}</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm mt-1">{r.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
