import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { appConfig } from "../../config";

const token = localStorage.getItem("token");

const ip = `${appConfig.ip}/api`;

const userData = JSON.parse(localStorage.getItem("myInfo"));

export const sendChatMessage = createAsyncThunk(
  "sendChatMessage",
  async (data, { rejectWithValue, fulfillWithValue }) => {
    console.log(data);
    const input = {
      senderId: userData.id,
      receiverId: data.receiverId,
      content: data.content,
      groupId: data.groupId,
      type: "TEXT",
    };

    try {
      const response = await fetch(`${ip}/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async ({ chatId, chatType, ip }, thunkAPI) => {
    try {
      const endpoint =
        chatType === "group"
          ? `${ip}/api/chat/history/group/${chatId}`
          : `${ip}/api/chat/history/user/${chatId}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(errorData);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ message: error.message });
    }
  }
);

export const chatDetail = createSlice({
  name: "chat",
  initialState: {
    message: null,
    messages: [],
    loading: false,
    error: null,
    searchData: [],
    count: 0,
  },

  reducers: {
    receiveChatMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    setUsers: (state, action) => {
      state.users = action.payload;
    },
    // For private 1-on-1 messages
    addMessage: (state, action) => {
      const message = action.payload;
      console.log(message)
      const chatId = message.chatId || message.fromUserId || message.toUserId;
      if (!state.privateMessages[chatId]) {
        state.privateMessages[chatId] = [];
      }
      state.privateMessages[chatId].push(message);
    },

    // For group messages
    addGroupMessage: (state, action) => {
      const message = action.payload;
      const groupId = message.groupId;
      if (!state.groupMessages[groupId]) {
        state.groupMessages[groupId] = [];
      }
      state.groupMessages[groupId].push(message);
    },
    setPrivateMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      state.privateMessages[chatId] = messages;
    },

    setGroupMessages: (state, action) => {
      const { groupId, messages } = action.payload;
      state.groupMessages[groupId] = messages;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(sendChatMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.loading = false;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const {
  receiveChatMessage,
  addMessage,
  addGroupMessage,
  setPrivateMessages,
  setGroupMessages,
} = chatDetail.actions;
export default chatDetail.reducer;
