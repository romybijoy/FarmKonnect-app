import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../service/FetchService";
import { appConfig } from "../../config";

const baseUrl = `${appConfig.ip}/api/notifications`;

// Fetch notifications for current user
export const fetchNotifications = createAsyncThunk(
  "notification/fetchAll",
  async (data, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${baseUrl}/${data.id}`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Mark a notification as read
export const markAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${baseUrl}/read/${notificationId}`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Redux Thunk
export const markAllAsRead = createAsyncThunk(
  "notification/markAllAsRead",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${baseUrl}/read-all/${userId}`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to mark all as read");
      return userId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(markAsRead.fulfilled, (state, action) => {
        const id = action.payload;
        const notif = state.notifications.find((n) => n._id === id);
        if (notif) notif.read = true;
      })
      .addCase(markAllAsRead.fulfilled, (state, action) => {
        state.notifications = state.notifications.map((notif) => ({
          ...notif,
          read: true,
        }));
      });
  },
});

export default notificationSlice.reducer;
