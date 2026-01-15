import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { appConfig } from "../../config";
import { fetchWithAuth } from "../../service/FetchService";

const ip = `${appConfig.ip}/user`;


export const fetchSuggestions = createAsyncThunk(
  "suggestions/fetchSuggestions",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userId = state.auth?.userInfo?.userId;

      if (!userId) {
        return rejectWithValue("User not loaded. Please log in again.");
      }

      const response = await fetchWithAuth(
        `${ip}/suggestions?meId=${userId}&size=5`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        let errorMessage = "Unable to load suggestions.";
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
        } catch (e) {
          // non-JSON error, ignore
        }
        return rejectWithValue(errorMessage);
      }

      const data = await response.json();
      // If your controller returns List<UserSuggestionDto> => this is already an array
      return data;
    } catch (err) {
      console.error("Suggestion API error:", err);
      return rejectWithValue("Network error while loading suggestions.");
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const suggestionSlice = createSlice({
  name: "suggestions",
  initialState,
  reducers: {
    clearSuggestions(state) {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuggestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load suggestions.";
        state.items = [];
      });
  },
});

export const { clearSuggestions } = suggestionSlice.actions;
export default suggestionSlice.reducer;
