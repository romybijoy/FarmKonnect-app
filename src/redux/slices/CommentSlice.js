// commentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../service/FetchService";

import { appConfig } from "../../config";

const token = localStorage.getItem("token");

const ip = `${appConfig.ip}/api`;

// ✅ Fetch comments
export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (postId) => {
    const res = await fetchWithAuth(`${ip}/post/${postId}/comments`);
    return res.json();
  }
);

// ✅ Add comment
export const addComment = createAsyncThunk(
  "comments/addComment",
  async ({ postId, userId, content, parentId = null }) => {
    const res = await fetchWithAuth(`${ip}/post/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, content, parentId }),
    });

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    return await res.json(); // direct parse since body exists
  }
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
  }
);

const commentSlice = createSlice({
  name: "comments",
  initialState: {
    items: [],
    loading: false,
    counts: {},
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(fetchCommentCount.fulfilled, (state, action) => {
        const { postId, count } = action.payload;
        state.counts[postId] = count;
        state.status = "succeeded";
      })
      .addCase(fetchCommentCount.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default commentSlice.reducer;
