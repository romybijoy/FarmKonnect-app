import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
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
      const res = await fetchWithAuth(`${baseUrl}/read/${notificationId.id}`, {
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
    actionLoading: false, // for mark read actions
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

      // MARK SINGLE
      .addCase(markAsRead.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.actionLoading = false;
        const notif = state.notifications.find((n) => n.id === action.payload.id);
        if (notif) {
          notif.read = true;
        }
      })
      .addCase(markAsRead.rejected, (state) => {
        state.actionLoading = false;
      })
 
      // MARK ALL
      .addCase(markAllAsRead.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.actionLoading = false;
        state.notifications = state.notifications.map((notif) => ({
          ...notif,
          read: true,
        }));
      })
      .addCase(markAllAsRead.rejected, (state) => {
        state.actionLoading = false;
      });
  },
});


export const selectUnreadCount = createSelector(
  (state) => state.notifications.notifications,
  (notifications) => notifications.filter((n) => !n.read).length
);

export default notificationSlice.reducer;
