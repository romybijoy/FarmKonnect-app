// commentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../service/FetchService";

import { appConfig } from "../../config";

const token = localStorage.getItem("token");

const ip = `${appConfig.ip}/api`;

//   Fetch comments
export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async ({ postId, page = 0, size = 5 }) => {
    const res = await fetchWithAuth(
      `${ip}/post/${postId}/comments?page=${page}&size=${size}`,
    );

    const data = await res.json();

    return {
      postId,
      content: data.content,
      last: data.last,
    };
  },
);

//fetch replies for a comment
export const fetchReplies = createAsyncThunk(
  "comments/fetchReplies",
  async ({ postId, commentId, page = 0, size = 5 }) => {
    const res = await fetchWithAuth(
      `${ip}/post/${postId}/comments/${commentId}/replies?page=${page}&size=${size}`,
    );
    const data = await res.json();
    return { commentId, data };
  },
);

//   Add comment
export const addComment = createAsyncThunk(
  "comments/addComment",
  async ({ postId, content, parentId = null }) => {
    const res = await fetchWithAuth(`${ip}/post/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, parentId }),
    });

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    return await res.json(); // direct parse since body exists
  },
);

export const fetchCommentCount = createAsyncThunk(
  "comments/fetchCommentCount",
  async (postId) => {
    const response = await fetchWithAuth(`${ip}/post/${postId}/comments/count`);
    if (!response.ok) {
      throw new Error("Failed to fetch comment count");
    }
    const count = await response.json(); // backend returns number
    return { postId, count }; // 👈 shape matches your reducer
  },
);

// Toggle Like
export const toggleCommentLike = createAsyncThunk(
  "comments/toggleCommentLike",
  async ({ postId, commentId }) => {
    const res = await fetchWithAuth(
      `${ip}/post/${postId}/comments/${commentId}/like`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    return { commentId };
  },
);

// Toggle Reaction
export const toggleCommentReaction = createAsyncThunk(
  "comments/toggleCommentReaction",
  async ({ postId, commentId, emoji }) => {
    const res = await fetchWithAuth(
      `${ip}/post/${postId}/comments/${commentId}/reaction`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emoji }),
      },
    );

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    return { commentId, emoji };
  },
);

// ✏ Update Comment
export const updateComment = createAsyncThunk(
  "comments/updateComment",
  async ({ postId, commentId, content }) => {
    const res = await fetchWithAuth(
      `${ip}/post/${postId}/comments/${commentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      },
    );

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    return { commentId, content };
  },
);

// 🗑 Delete Comment
export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async ({ postId, commentId }) => {
    const res = await fetchWithAuth(
      `${ip}/post/${postId}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    return { commentId };
  },
);

function updateReactionState(comment, emoji) {
  if (!comment.reactions) comment.reactions = [];

  // Find previous reaction by current user
  const previous = comment.reactions.find((r) => r.reactedByCurrentUser);

  // If user clicked same emoji → remove it
  if (previous && previous.emoji === emoji) {
    previous.count -= 1;
    previous.reactedByCurrentUser = false;

    if (previous.count === 0) {
      comment.reactions = comment.reactions.filter((r) => r.count > 0);
    }

    return;
  }

  // If user had different reaction → remove it
  if (previous) {
    previous.count -= 1;
    previous.reactedByCurrentUser = false;

    if (previous.count === 0) {
      comment.reactions = comment.reactions.filter((r) => r.count > 0);
    }
  }

  // Add or update new emoji
  const existing = comment.reactions.find((r) => r.emoji === emoji);

  if (existing) {
    existing.count += 1;
    existing.reactedByCurrentUser = true;
  } else {
    comment.reactions.push({
      emoji,
      count: 1,
      reactedByCurrentUser: true,
    });
  }
}

const commentSlice = createSlice({
  name: "comments",
  initialState: {
    commentsByPost: {},
    replies: {},
    hasMore: true,
    loading: false,
    counts: {},
    status: "idle",
    error: null,
  },
  reducers: {
    resetComments: (state, action) => {
      const postId = action.payload;

      if (state.commentsByPost[postId]) {
        delete state.commentsByPost[postId];
      }
      state.replies = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        const { postId, content, last } = action.payload;

        if (!state.commentsByPost[postId]) {
          state.commentsByPost[postId] = {
            items: [],
            page: 0,
            hasMore: true,
          };
        }

        state.commentsByPost[postId].items = content;
        state.commentsByPost[postId].hasMore = !last;
      })
      .addCase(fetchComments.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchReplies.fulfilled, (state, action) => {
        const { commentId, data } = action.payload;

        if (!state.replies[commentId]) {
          state.replies[commentId] = {
            items: [],
            page: 0,
            hasMore: true,
          };
        }

        state.replies[commentId].items = [
          ...state.replies[commentId].items,
          ...data.content,
        ];

        state.replies[commentId].page += 1;
        state.replies[commentId].hasMore = !data.last;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const newComment = action.payload;
        const postId = newComment.postId;

        if (!state.commentsByPost[postId]) {
          state.commentsByPost[postId] = {
            items: [],
            hasMore: true,
          };
        }

        if (newComment.parentId) {
          const parentId = newComment.parentId;

          if (!state.replies[parentId]) {
            state.replies[parentId] = {
              items: [],
              page: 0,
              hasMore: false,
            };
          }

          // ONLY insert into replies
          state.replies[parentId].items.push(newComment);
        } else {
          // Top-level comment
          state.commentsByPost[postId].items.unshift(newComment);
        }
      })
      .addCase(fetchCommentCount.fulfilled, (state, action) => {
        const { postId, count } = action.payload;
        state.counts[postId] = count;
        state.status = "succeeded";
      })
      .addCase(fetchCommentCount.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // LIKE
      .addCase(toggleCommentLike.fulfilled, (state, action) => {
        const { commentId } = action.payload;
        const comment = state.comments.find((c) => c.id === commentId);

        if (comment) {
          comment.liked = !comment.liked;
          comment.likeCount += comment.liked ? 1 : -1;
        }
      })

      // REACTION
      .addCase(toggleCommentReaction.fulfilled, (state, action) => {
        const { commentId, emoji } = action.payload;

        // Update top-level comments
        Object.values(state.commentsByPost || {}).forEach((post) => {
          post?.items?.forEach((comment) => {
            if (comment.id === commentId) {
              updateReactionState(comment, emoji);
            }
          });
        });

        // Update replies
        Object.values(state.replies || {}).forEach((replyGroup) => {
          replyGroup?.items?.forEach((reply) => {
            if (reply.id === commentId) {
              updateReactionState(reply, emoji);
            }
          });
        });
      })

      // UPDATE
      .addCase(updateComment.fulfilled, (state, action) => {
        const { commentId, content } = action.payload;

        // Update top-level comments
        Object.values(state.commentsByPost || {}).forEach((post) => {
          if (!post?.items) return;

          const comment = post.items.find((c) => c.id === commentId);
          if (comment) {
            comment.content = content;
            comment.edited = true;
          }
        });

        // Update replies
        Object.values(state.replies || {}).forEach((replyGroup) => {
          if (!replyGroup?.items) return;

          const reply = replyGroup.items.find((r) => r.id === commentId);
          if (reply) {
            reply.content = content;
            reply.edited = true;
          }
        });
      })

      // DELETE
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { commentId } = action.payload;

        // Check top-level comments
        Object.values(state.commentsByPost).forEach((post) => {
          const comment = post.items.find((c) => c.id === commentId);
          if (comment) {
            comment.deleted = true;
            comment.content = "This comment was deleted";
          }
        });

        // Check replies
        Object.values(state.replies).forEach((replyGroup) => {
          const reply = replyGroup.items.find((r) => r.id === commentId);
          if (reply) {
            reply.deleted = true;
            reply.content = "This comment was deleted";
          }
        });
      });
  },
});

export const { resetComments } = commentSlice.actions;

export default commentSlice.reducer;
