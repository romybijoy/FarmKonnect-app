import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { appConfig } from "../../config";
import { fetchWithAuth } from "../../service/FetchService";

const token = localStorage.getItem("token");

const ip = `${appConfig.ip}/api`;

// 🔁 Async thunk to fetch presence
export const fetchPresence = createAsyncThunk(
  "presence/fetchPresence",
  async (email, { rejectWithValue, fulfillWithValue }) => {


    console.log(email)
    try {
      const response = await fetchWithAuth(`${ip}/presence/${email}`, {
        method: "GET",
      });

      if (!response.ok) {
        return rejectWithValue(await response.text()); // or use `response.status`
      }

      const data = await response.json();
      return fulfillWithValue({ email, ...data });
    } catch (error) {
      console.error("fetchPresence error:", error);
      return rejectWithValue(error.message || "Error fetching presence");
    }
  }
);


const PresenceSlice = createSlice({
  name: "presence",
  initialState: {
    data: {},
    users: {}, // email -> { online, lastSeen }
    loading: false,
    error: null,
  },
  reducers: {
     setUserPresence(state, action) {
      const { email, presence } = action.payload;
      state.data[email] = presence;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPresence.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPresence.fulfilled, (state, action) => {
        const { email, online, lastSeen } = action.payload;
        console.log(action.payload)
        state.users[email] = { online, lastSeen };
        state.loading = false;
      })
      .addCase(fetchPresence.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch presence";
      });
  },
});

export const { setUserPresence } = PresenceSlice.actions;
export default PresenceSlice.reducer;
