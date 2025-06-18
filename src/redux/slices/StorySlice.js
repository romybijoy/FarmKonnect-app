import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { appConfig } from "../../config";

const token = localStorage.getItem("token");

const ip = `${appConfig.ip}/api/stories`;

const userData = JSON.parse(localStorage.getItem("myInfo"));

export const createStory = createAsyncThunk(
  "createStory",
  async (data, { rejectWithValue, fulfillWithValue }) => {
    console.log(data)

    try {
      const response = await fetch(`${ip}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
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
export const showStory = createAsyncThunk(
  "showStory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${ip}/active`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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



export const storyDetail = createSlice({
  name: "story",
  initialState: {
    stories: [],
    loading: false,
    error: null,
    searchData: [],
    count: 0,
  },

  reducers: {

  },

  extraReducers: (builder) => {
    builder

      .addCase(createStory.pending, (state) => {
        state.loading = true;
      })
      .addCase(createStory.fulfilled, (state, action) => {
        state.loading = false;
        // state.categories.push(action.payload);
      })
      .addCase(createStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(showStory.pending, (state) => {
        state.loading = true;
      })
      .addCase(showStory.fulfilled, (state, action) => {
        state.loading = false;
        state.stories = action.payload;
      })
      .addCase(showStory.rejected, (state, action) => {
        state.loading = false;
        state.stories = [];
        state.error = action.payload.message;
      });

  },
});

export default storyDetail.reducer;

export const { } = storyDetail.actions;
