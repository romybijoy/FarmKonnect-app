import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addComment,
  fetchReplies,
  toggleCommentLike,
  toggleCommentReaction,
  updateComment,
  deleteComment,
} from "../../redux/slices/CommentSlice";
import { formatDistanceToNow } from "date-fns";

function Comment({ comment, postId, depth = 0 }) {
  const REACTIONS = ["❤️", "🔥", "😂", "😮"];
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const breakdownRef = useRef(null);
  const dispatch = useDispatch();
  const repliesState = useSelector(
    (state) => state.comments.replies[comment.id],
  );

  const replies = repliesState?.items || [];
  const hasMoreReplies = repliesState?.hasMore;

  const [reply, setReply] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const userData = JSON.parse(localStorage.getItem("myInfo") || "{}");

  const totalReactions =
    comment.reactions?.reduce((sum, r) => sum + r.count, 0) || 0;

  const userReaction = comment.reactions?.find((r) => r.reactedByCurrentUser);

  const handleReply = () => {
    if (!reply.trim()) return;

    dispatch(
      addComment({
        postId,
        content: reply.trim(),
        parentId: comment.id,
      }),
    );

    setReply("");
    setShowReplyBox(false);

    setShowReplies(true);
  };

  const loadReplies = () => {
    setShowReplies(true);
    dispatch(fetchReplies({ postId, commentId: comment.id }));
  };

  const handleLike = () => {
    dispatch(toggleCommentLike({ postId, commentId: comment.id }));
  };

  const handleReaction = (emoji) => {
    dispatch(toggleCommentReaction({ postId, commentId: comment.id, emoji }));
  };

  const handleDelete = () => {
    dispatch(deleteComment({ postId, commentId: comment.id }));
  };

  const handleUpdate = () => {
    if (!editedContent.trim()) return;

    dispatch(
      updateComment({
        postId,
        commentId: comment.id,
        content: editedContent.trim(),
      }),
    );

    setIsEditing(false);
  };

  useEffect(() => {
    setEditedContent(comment.content);
  }, [comment.content]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }

      if (breakdownRef.current && !breakdownRef.current.contains(e.target)) {
        setShowBreakdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="py-3 px-3 sm:px-4 border-b last:border-none">
      <div className="flex gap-3 items-start">
        <img
          src={comment?.profileImage || "/profile.png"}
          alt="user"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border"
        />

        <div className="flex-1">
          <div className="bg-gray-100 rounded-2xl px-3 sm:px-4 py-2 relative break-words">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">{comment.userName}</span>
                <span className="text-gray-400 text-xs text-[11px]">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              {userData?.id === comment.userId && !comment.deleted && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-gray-500 hover:text-black"
                  >
                    ⋮
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 mt-1 w-24 bg-white border rounded-md shadow-md text-xs z-50">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          handleDelete();
                          setShowMenu(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-red-500 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {isEditing ? (
              <div className="mt-1">
                <input
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full bg-white px-2 py-1 rounded text-sm border"
                />
                <div className="flex gap-2 mt-1 text-xs">
                  <button onClick={handleUpdate} className="text-blue-600">
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm mt-1">
                {comment.deleted ? (
                  <p className="italic text-gray-400 text-sm">
                    This comment was deleted
                  </p>
                ) : (
                  <p>
                    {comment.content}
                    {comment.edited && (
                      <span className="text-xs text-gray-400 ml-2">
                        (edited)
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {!comment.deleted && (
            <div className="relative flex items-center gap-4 text-xs text-gray-500 mt-1.5 ml-2">
              {/* ❤️ Like */}
              {/* <button onClick={handleLike} className="flex items-center gap-1">
                <span>{comment.liked ? "❤️" : "🤍"}</span>
                <span>{comment.likeCount || 0}</span>
              </button> */}

              {/* 😀 Reaction */}
              <div className="relative flex items-center gap-2">
                <div className="relative flex items-center gap-2">
                  {!comment.deleted && (
                    <>
                      {/* Reaction Button */}
                      <button
                        onClick={() => {
                          if (userReaction) {
                            handleReaction(userReaction.emoji);
                          } else {
                            setShowReactions(true);
                          }
                        }}
                        className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full transition ${
                          userReaction ? "bg-gray-100" : "hover:bg-gray-100"
                        }`}
                      >
                        <span
                          className={`transition ${
                            userReaction
                              ? "opacity-100 scale-105"
                              : "opacity-50 hover:opacity-80"
                          }`}
                        >
                          {userReaction ? userReaction.emoji : "🙂"}
                        </span>
                      </button>

                      {/* Reaction Count (Separate Button) */}
                      {totalReactions > 0 && (
                        <button
                          onClick={() => setShowBreakdown((prev) => !prev)}
                          className="text-xs text-gray-500 hover:underline"
                        >
                          {totalReactions}
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Emoji Picker */}
                {showReactions && (
                  <div className="absolute top-7 left-0 bg-white shadow-md rounded-full px-2 sm:px-3 py-1 flex gap-2 z-50 max-w-[90vw]">
                    {REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          handleReaction(emoji);
                          setShowReactions(false);
                        }}
                        className="hover:scale-125 transition"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {showBreakdown && totalReactions > 0 && (
                <div
                  ref={breakdownRef}
                  className="absolute top-8 left-0 bg-white shadow-xl rounded-xl p-3 text-sm z-50
               w-44 max-w-[90vw]
               animate-fadeIn"
                >
                  {comment.reactions.map((r) => (
                    <div
                      key={r.emoji}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-base">{r.emoji}</span>
                      <span className="text-gray-600 text-xs">{r.count}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply */}
              {!comment.deleted && depth < 1 && (
                <button onClick={() => setShowReplyBox(!showReplyBox)}>
                  Reply
                </button>
              )}

              {/* View Replies */}
              {comment.replyCount > 0 && !showReplies && (
                <button onClick={loadReplies} className="text-blue-600">
                  View {comment.replyCount} replies
                </button>
              )}
            </div>
          )}

          {/* Reply Box */}
          {!comment.deleted && depth < 1 && showReplyBox && (
            <div
              className="flex items-center gap-2 mt-2"
              style={{ marginLeft: `${Math.min(depth, 3) * 16}px` }}
            >
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReply()}
                placeholder={`Reply to ${comment.userName}...`}
                className="flex-1 bg-gray-100 px-3 py-1.5 rounded-full text-sm focus:outline-none"
              />

              <button
                onClick={handleReply}
                disabled={!reply.trim()}
                className={`text-xs font-semibold ${
                  reply.trim()
                    ? "text-blue-600"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                Reply
              </button>
            </div>
          )}

          {/* Lazy Replies */}
          {showReplies &&
            replies.map((r) => (
              <div key={r.id} className="ml-4 sm:ml-8">
                <Comment comment={r} postId={postId} depth={depth + 1} />
              </div>
            ))}

          {/* Load more replies */}
          {showReplies && hasMoreReplies && (
            <button
              onClick={() =>
                dispatch(
                  fetchReplies({
                    commentId: comment.id,
                    page: repliesState.page,
                  }),
                )
              }
              className="ml-8 mt-2 text-xs text-blue-600"
            >
              Load more replies
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Comment;
