import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { appConfig } from "../../config";
import { fetchWithAuth } from "../../service/FetchService";

const ip = `${appConfig.ip}/api`;

// Get reactions for a message
export const fetchReactions = createAsyncThunk(
  "reactions/fetchReactions",
  async (messageId) => {
    const res = await fetchWithAuth(`${ip}/reactions/${messageId}`);
    if (!res.ok) throw new Error("Failed to fetch reactions");
    return { messageId, reactions: await res.json() };
  },
);

// Add or update reaction
export const addOrUpdateReaction = createAsyncThunk(
  "reactions/addOrUpdateReaction",
  async ({ messageId, userId, emoji }) => {
    const res = await fetchWithAuth(`${ip}/reactions/${messageId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, emoji }),
    });

    if (!res.ok) throw new Error("Failed to add or update reaction");
    return { messageId, reaction: await res.json() };
  },
);

// Remove reaction
export const removeReaction = createAsyncThunk(
  "reactions/removeReaction",
  async ({ messageId, userId }) => {
    const res = await fetchWithAuth(
      `${ip}/reactions/${messageId}?userId=${userId}`,
      {
        method: "DELETE",
      },
    );
    if (!res.ok) throw new Error("Failed to remove reaction");
    return { messageId, userId };
  },
);

const reactionsSlice = createSlice({
  name: "reactions",
  initialState: {
    byMessageId: {}, // { messageId: [ { userId, emoji } ] }
    loading: false,
    error: null,
    addReactionStatus: "idle",
    removeReactionStatus: "idle",
  },
  reducers: {
    addOrUpdateReactionFromWS: (state, action) => {
      const { messageId, userId, emoji } = action.payload;

      const existing = state.byMessageId[messageId] || [];

      const idx = existing.findIndex((r) => r.userId === userId);

      if (idx !== -1) {
        existing[idx].emoji = emoji;
      } else {
        existing.push({ userId, emoji });
      }

      state.byMessageId[messageId] = [...existing];
    },

    removeReactionFromWS: (state, action) => {
      const { messageId, userId } = action.payload;

      const existing = state.byMessageId[messageId] || [];

      state.byMessageId[messageId] = existing.filter(
        (r) => r.userId !== userId,
      );
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchReactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReactions.fulfilled, (state, action) => {
        const { messageId, reactions } = action.payload;
        state.loading = false;
        state.byMessageId[messageId] = reactions;
      })
      .addCase(fetchReactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addOrUpdateReaction.fulfilled, (state, action) => {
        const { messageId, reaction } = action.payload;
        const existing = state.byMessageId[messageId] || [];

        // Update or insert
        const idx = existing.findIndex((r) => r.userId === reaction.userId);
        if (idx !== -1) {
          existing[idx] = reaction;
        } else {
          existing.push(reaction);
        }

        state.byMessageId[messageId] = existing;
      })
      .addCase(removeReaction.fulfilled, (state, action) => {
        const { messageId, userId } = action.payload;
        const existing = state.byMessageId[messageId] || [];
        state.byMessageId[messageId] = existing.filter(
          (r) => r.userId !== userId,
        );
      });
  },
});

export const {
  addOrUpdateReactionFromWS,
  removeReactionFromWS
} = reactionsSlice.actions;

export default reactionsSlice.reducer;
