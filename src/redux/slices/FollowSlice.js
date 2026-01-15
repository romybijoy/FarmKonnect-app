import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { appConfig } from "../../config";
import { fetchWithAuth } from "../../service/FetchService";

const token = localStorage.getItem("token");

const ip = `${appConfig.ip}/user`;

// const userData = JSON.parse(localStorage.getItem("myInfo"));

export const checkFollowStatus = createAsyncThunk(
  "follow/checkStatus",
  async ({ viewerId, targetUserId }, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(
        `${ip}/is-following?followerId=${viewerId}&followingId=${targetUserId}`
      );
      if (!res.ok) {
        const errorData = await res.json();
        return rejectWithValue(
          errorData.message || "Failed to check follow status"
        );
      }
      const data = await res.json();
      return { targetUserId, isFollowing: data.following };
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const followUser = createAsyncThunk(
  "follow/followUser",
  async ({ viewerId, targetUserId }, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${ip}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerId: viewerId,
          followingId: targetUserId,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        return rejectWithValue(errorData.message || "Failed to follow user");
      }
      return { targetUserId };
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const unfollowUser = createAsyncThunk(
  "follow/unfollowUser",
  async ({ viewerId, targetUserId }, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${ip}/unfollow`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerId: viewerId,
          followingId: targetUserId,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        return rejectWithValue(errorData.message || "Failed to unfollow user");
      }
      return { targetUserId };
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Thunk for fetching followers
export const fetchFollowers = createAsyncThunk(
  "follow/fetchFollowers",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${ip}/followers/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch followers");
      const data = await res.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk for fetching following
export const fetchFollowing = createAsyncThunk(
  "follow/fetchFollowing",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${ip}/following/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch following");
      const data = await res.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFollowCounts = createAsyncThunk(
  "follow/fetchFollowCounts",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${ip}/follow/count/${userId}`, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch follow counts");
      }

      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const followDetail = createSlice({
  name: "follow",
  initialState: {
    followers: [],
    following: [],
    followStatus: {},
    loading: {},
    globalLoading: false, // for fetchFollowers, fetchFollowing
    error: {},
    globalError: null,
    followersCount: 0,
    followingCount: 0,
    countLoading: false,
    countError: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(checkFollowStatus.pending, (state, action) => {
        const { targetUserId } = action.meta.arg;
        state.loading[targetUserId] = true;
        state.error[targetUserId] = null;
      })
      .addCase(checkFollowStatus.fulfilled, (state, action) => {
        const { targetUserId, isFollowing } = action.payload;
        state.followStatus[targetUserId] = isFollowing;
        state.loading[targetUserId] = false;
      })
      .addCase(checkFollowStatus.rejected, (state, action) => {
        const { targetUserId } = action.meta.arg;
        state.loading[targetUserId] = false;
        state.error[targetUserId] = action.payload;
      })

      // Follow User
      .addCase(followUser.pending, (state, action) => {
        const { targetUserId } = action.meta.arg;
        state.loading[targetUserId] = true;
        state.error[targetUserId] = null;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        const { targetUserId } = action.payload;
        state.followStatus[targetUserId] = true;
        state.loading[targetUserId] = false;
      })
      .addCase(followUser.rejected, (state, action) => {
        const { targetUserId } = action.meta.arg;
        state.loading[targetUserId] = false;
        state.error[targetUserId] = action.payload;
      })

      // Unfollow User
      .addCase(unfollowUser.pending, (state, action) => {
        const { targetUserId } = action.meta.arg;
        state.loading[targetUserId] = true;
        state.error[targetUserId] = null;
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        const { targetUserId } = action.payload;
        state.followStatus[targetUserId] = false;
        state.loading[targetUserId] = false;
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        const { targetUserId } = action.meta.arg;
        state.loading[targetUserId] = false;
        state.error[targetUserId] = action.payload;
      })
      // Fetch Followers
      .addCase(fetchFollowers.pending, (state) => {
        state.globalLoading = true;
        state.globalError = null;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.globalLoading = false;
        state.followers = action.payload;
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.globalLoading = false;
        state.globalError = action.payload;
        // toast.error(`Error fetching followers: ${action.payload}`);
      })

      // Fetch Following
      .addCase(fetchFollowing.pending, (state) => {
        state.globalLoading = true;
        state.globalError = null;
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.globalLoading = false;
        state.following = action.payload;
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.globalLoading = false;
        state.globalError = action.payload;
        // toast.error(`Error fetching following: ${action.payload}`);
      })

      //count followers and following
      .addCase(fetchFollowCounts.pending, (state) => {
        state.countLoading = true;
        state.countError = null;
      })
      .addCase(fetchFollowCounts.fulfilled, (state, action) => {
        console.log(action.payload)
        state.countLoading = false;
        state.followersCount = action.payload.followerCount;
        state.followingCount = action.payload.followingCount;
      })
      .addCase(fetchFollowCounts.rejected, (state, action) => {
        state.countLoading = false;
        state.countError = action.payload;
      });
  },
});

export default followDetail.reducer;

export const {} = followDetail.actions;
