import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { appConfig } from "../../config";
import { fetchWithAuth } from "../../service/FetchService";

import { toast } from "react-toastify";

const ip = `${appConfig.ip}/api`;

const userData = JSON.parse(localStorage.getItem("myInfo"));

export const createPost = createAsyncThunk(
  "createPost",
  async (data, { rejectWithValue, fulfillWithValue }) => {
    const input = {
      userId: userData?.id,
      content: data.content,
      postImages: data.postImages, // this should be a Firebase URL string
      email: userData?.email,
    };

    try {
      const response = await fetchWithAuth(`${ip}/post/create`, {
        method: "POST",
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        return rejectWithValue(response.status);
      }

      const result = await response.json();
      return fulfillWithValue(result);
    } catch (error) {
      console.error(error);
      return rejectWithValue(error);
    }
  }
);

//read action
export const showPost = createAsyncThunk(
  "showPost",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const id = userId ? userId :state.auth?.userInfo?.userId;

      const response = await fetchWithAuth(
        `${ip}/post/user/${id}?page=0&size=10`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const result = await response.json();
      console.log(result);
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const showFeed = createAsyncThunk(
  "showFeed",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const userId = state.auth?.userInfo?.userId;

      if (!userId) {
        return rejectWithValue("User not loaded yet. Please try again.");
      }

      const response = await fetchWithAuth(`${ip}/feed/${userId}`);

      if (!response.ok) {
        let errorMessage = "Server unavailable or returned an error";
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
        } catch {}
        return rejectWithValue(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(
        "Unable to reach the server. Please try again later."
      );
    }
  }
);

export const likePost = createAsyncThunk(
  "posts/likePost",
  async ({ postId }, { getState }) => {
    const userId = JSON.parse(localStorage.getItem("myInfo")).id;
    const state = getState().post;
    const isLiked = state.likesByPostId[postId]?.liked || false;

    if (isLiked) {
      await fetchWithAuth(`${ip}/post/${postId}/like?userId=${userId}`, {
        method: "DELETE",
      });
    } else {
      await fetchWithAuth(`${ip}/post/${postId}/like?userId=${userId}`, {
        method: "POST",
      });
    }

    const likeCountRes = await fetchWithAuth(`${ip}/post/${postId}/like-count`);
    const likeCount = await likeCountRes.json();

    const statusRes = await fetchWithAuth(
      `${ip}/post/${postId}/like-status?userId=${userId}`
    );
    const liked = await statusRes.json();

    return { postId, liked, likeCount };
  }
);

export const unlikePost = createAsyncThunk(
  "posts/unlikePost",
  async (postId, thunkAPI) => {
    try {
      const response = await fetchWithAuth(
        `${ip}/${postId}/like?userId=${userData.id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to unlike post");
      const data = await response.json(); // { liked, likeCount }

      return { postId, ...data };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Fetch like count for a post
export const fetchLikeCount = createAsyncThunk(
  "posts/fetchLikeCount",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${ip}/post/${postId}/like-count`);
      if (!res.ok) {
        throw new Error("Failed to fetch like count");
      }
      const data = await res.json(); // { count: 42 }
      return { postId, likeCount: data.count };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Fetch like status for a user + post
export const fetchLikeStatus = createAsyncThunk(
  "posts/fetchLikeStatus",
  async ({ postId, userId }, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(
        `${ip}/post/${postId}/like-status?userId=${userId}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch like status");
      }
      const data = await res.json(); // { liked: true }
      return { postId, liked: data.liked };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleSavePost = createAsyncThunk(
  "posts/toggleSavePost",
  async ({ postId, userId }, { getState }) => {
    const state = getState().post;
    const isSaved = state.savedByPostId[postId]?.saved || false;

    // Toggle save status
    if (isSaved) {
      await fetchWithAuth(`${ip}/post/${postId}/save?userId=${userId}`, {
        method: "DELETE",
      });
    } else {
      await fetchWithAuth(`${ip}/post/${postId}/save?userId=${userId}`, {
        method: "POST",
      });
    }

    // Get updated save count
    const countRes = await fetchWithAuth(`${ip}/post/${postId}/save-count`);
    const count = await countRes.json();

    return {
      postId,
      saved: !isSaved,
      count,
      message: isSaved ? "Post removed from saved" : "Post saved successfully",
    };
  }
);

export const getSavedPosts = createAsyncThunk(
  "posts/getSavedPosts",
  async ({ userId }, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${ip}/post/saved/${userId}`, {
        method: "GET",
      });

      if (!res.ok) {
        const error = await res.text();
        return rejectWithValue(error || "Failed to fetch saved posts");
      }

      const posts = await res.json();
      return posts; // this will be a list of Post objects
    } catch (error) {
      return rejectWithValue(error.message || "Fetch failed");
    }
  }
);

// fetch save status
export const fetchSaveStatus = createAsyncThunk(
  "posts/fetchSaveStatus",
  async ({ postId, userId }) => {
    const res = await fetchWithAuth(
      `${ip}/post/${postId}/save-status?userId=${userId}`
    );
    const saved = await res.json();
    return { postId, saved };
  }
);

// fetch save count
export const fetchSaveCount = createAsyncThunk(
  "posts/fetchSaveCount",
  async (postId) => {
    const res = await fetchWithAuth(`${ip}/post/${postId}/save-count`);
    const count = await res.json();
    return { postId, count };
  }
);

export const repostPost = createAsyncThunk(
  "posts/repostPost",
  async ({ postId, userId, userDto }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(
        `${ip}/post/${postId}/repost/${userId}`,
        {
          method: "POST",
          body: JSON.stringify(userDto),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to repost");
      }

      const data = await response.json();
      return data; // return PostDto from backend
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPostById = createAsyncThunk(
  "fetchPostById",
  async (id, { rejectWithValue }) => {
    const response = await fetch(`${appConfig.ip}/post/${id}`, {
      method: "GET",
    });

    try {
      const result = await response.json();
      console.log(result);
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const hidePost = createAsyncThunk(
  "post/hidePost",
  async ({ userId, postId }) => {
    await fetchWithAuth(`${ip}/feed/${userId}/hide/${postId}`, {
      method: "POST",
    });

    return {
      postId,
      message: "Post removed from your feed",
    };
  }
);

// report post action
export const reportPost = createAsyncThunk(
  "post/reportPost",
  // payload: { postId, reporterId, reason, details }
  async (payload, { rejectWithValue }) => {
    try {
      const { postId, reporterId, reason, details } = payload;
      const res = await fetchWithAuth(`${ip}/post/${postId}/report`, {
        method: "POST",
        // headers: {
        //   "Content-Type": "application/json",
        //   // include auth header if your API needs it, e.g. Authorization Bearer ...
        // },
        body: JSON.stringify({
          reporterId,
          reason,
          details,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const message = json?.message || `Failed with status ${res.status}`;
        return rejectWithValue(message);
      }

      const data = await res.json();
      return data; // whatever backend returns, e.g. { success: true }
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

//delete action

export const deletePost = createAsyncThunk(
  "post/deletePost",
  async ({ postId, userId }, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${ip}/post/${postId}?userId=${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete post");

      return postId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// //update action
export const updatePost = createAsyncThunk(
  "post/updatePost",
  async ({ postId, userId, content, postImages }, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${ip}/post/${postId}?userId=${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, postImages }),
      });

      if (!res.ok) throw new Error("Failed to update post");

      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const postDetail = createSlice({
  name: "post",
  initialState: {
    posts: [],
    loading: false,
    error: null,
    searchData: [],
    count: 0,
    likesByPostId: {}, // postId: { liked: boolean, likeCount: number }
    savedByPostId: {},
    saveCountsByPostId: {},
    savedPosts: [],
    savedPostsLoading: false,
    savedPostsError: null,
    reportStatus: "idle",
    reportError: null,
  },

  reducers: {
    searchUser: (state, action) => {
      console.log(action.payload);
      state.searchData = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(createPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        // state.categories.push(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(showPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(showPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.content;
        state.count = action.payload.totalElements;
      })
      .addCase(showPost.rejected, (state, action) => {
        state.loading = false;
        state.posts = [];
        state.error = action.payload.message;
      })
      .addCase(showFeed.pending, (state) => {
        state.loading = true;
      })
      .addCase(showFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(showFeed.rejected, (state, action) => {
        state.loading = false;
        state.posts = [];
        state.error = action.payload.message;
      })

      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, liked, likeCount } = action.payload;
        state.likesByPostId[postId] = {
          liked: liked.liked,
          likeCount: likeCount.count,
        };
      })

      .addCase(likePost.rejected, (state, action) => {
        console.error("Failed to like post:", action.error);
      })
      .addCase(fetchLikeCount.fulfilled, (state, action) => {
        const { postId, likeCount } = action.payload;
        state.likesByPostId[postId] = {
          ...(state.likesByPostId[postId] || {}),
          likeCount,
        };
      })
      .addCase(fetchLikeStatus.fulfilled, (state, action) => {
        const { postId, liked } = action.payload;
        state.likesByPostId[postId] = {
          ...(state.likesByPostId[postId] || {}),
          liked: liked,
        };
      });
    // SAVE
    builder.addCase(toggleSavePost.fulfilled, (state, action) => {
      const { postId, saved, count, message } = action.payload;

      state.savedByPostId[postId] = { saved, count };

      toast.success(message);
    });

    builder
      .addCase(toggleSavePost.rejected, () => {
        toast.error("Something went wrong. Please try again.");
      })
      .addCase(getSavedPosts.pending, (state) => {
        state.savedPostsLoading = true;
        state.savedPostsError = null;
      })
      .addCase(getSavedPosts.fulfilled, (state, action) => {
        console.log(action.payload);
        state.savedPosts = action.payload;
        state.savedPostsLoading = false;
      })
      .addCase(getSavedPosts.rejected, (state, action) => {
        state.savedPostsError = action.payload;
        state.savedPostsLoading = false;
      })
      .addCase(fetchSaveStatus.fulfilled, (state, action) => {
        const { postId, saved } = action.payload;
        state.savedByPostId[postId] = saved;
        state.savedByPostId[postId] = {
          ...(state.savedByPostId[postId] || {}),
          saved,
        };
      })
      .addCase(fetchSaveCount.fulfilled, (state, action) => {
        const { postId, count } = action.payload;
        state.savedByPostId[postId] = {
          ...(state.savedByPostId[postId] || {}),
          count,
        };
      })
      .addCase(repostPost.fulfilled, (state, action) => {
        // Add the new reposted post to the feed
        state.posts.unshift(action.payload); // push to top of feed
      })
      .addCase(repostPost.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.post = action.payload.post;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
    builder.addCase(hidePost.fulfilled, (state, action) => {
      const { postId, message } = action.payload;

      // Remove post from feed
      state.posts = state.posts.filter((post) => post.id !== postId);

      toast.success(message);
    });

    builder
      .addCase(hidePost.rejected, () => {
        toast.error("Failed to remove post. Please try again.");
      })
      .addCase(reportPost.pending, (state) => {
        state.reportStatus = "loading";
        state.reportError = null;
      })
      .addCase(reportPost.fulfilled, (state, action) => {
        state.reportStatus = "succeeded";
        state.reportError = null;
        // optionally store last report or counts: e.g.
        // state.lastReport = action.payload;
      })
      .addCase(reportPost.rejected, (state, action) => {
        state.reportStatus = "failed";
        state.reportError = action.payload || action.error.message;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p.id !== action.payload);
        toast.success("Post deleted");
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        toast.success("Post updated");
      });
  },
});

export default postDetail.reducer;

export const {} = postDetail.actions;
