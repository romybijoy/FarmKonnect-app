import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { appConfig } from "../../config";

import { fetchWithAuth } from "../../service/FetchService";

const ip = `${appConfig.ip}/api`;

// ---------------- CREATE APPEAL ----------------
export const createAppeal = createAsyncThunk(
  "appeals/create",
  async ({ userId, postId, reason }, { rejectWithValue }) => {
    console.log(userId, postId, reason);
    try {
      const response = await fetchWithAuth(`${ip}/post/appeals`, {
        method: "POST",
        body: JSON.stringify({
          postId,
          userId,
          reason,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to submit appeal");
      }

      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const fetchUserAppeals = createAsyncThunk(
  "appeals/fetchUserAppeals",
  async ({ userId }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(
        `${ip}/post/appeals/user/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch appeals");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// ---------------- SLICE ----------------
const appealSlice = createSlice({
  name: "appeals",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(createAppeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppeal.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createAppeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserAppeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAppeals.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.content;
      })
      .addCase(fetchUserAppeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default appealSlice.reducer;
