import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { appConfig } from "../../config";
import { fetchWithAuth } from "../../service/FetchService";

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
      const response = await fetchWithAuth(`${ip}/chat/send`, {
        method: "POST",
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
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();

      return { chatId, chatType, messages: data };
    } catch (error) {
      return thunkAPI.rejectWithValue({ message: error.message });
    }
  }
);


// group

export const createGroup = createAsyncThunk(
  "group/create",
  async (groupData, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${ip}/chat/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(groupData),
      });

      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.message || "Failed to create group");
      }

      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

export const addGroupMember = createAsyncThunk(
  "group/addMember",
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${ip}/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.message || "Failed to add member");
      }

      return { groupId, userId };
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);


export const getGroupMembers = createAsyncThunk(
  "group/getMembers",
  async (groupId, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${ip}/groups/${groupId}/members`);

      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.message || "Failed to get group members");
      }

      const members = await res.json();
      return { groupId, members };
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);


export const getAllGroups = createAsyncThunk(
  "group/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${ip}/chat/groups`);

      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.message || "Failed to fetch groups");
      }

      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
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
    privateMessages: {},
    groupMessages: {},
    count: 0,
    groups: [],              // All groups
    groupMembers: {}, 
    groupLoading: false,
    groupError: null,
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
       const { message, currentUserId } = action.payload;
      console.log("Received message:", message);

    
      const chatPartnerId =
        message.senderId === currentUserId
          ? message.receiverId
          : message.senderId;

      if (!chatPartnerId) {
        console.error("Cannot determine chat partner ID");
        return;
      }

      if (!state.privateMessages[chatPartnerId]) {
        state.privateMessages[chatPartnerId] = [];
      }

      const existing = state.privateMessages[chatPartnerId].some(
        (msg) => msg.id === message.id
      );
      if (!existing) {
        state.privateMessages[chatPartnerId].push(message);
      }
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
        const { chatId, chatType, messages } = action.payload;
        state.loading = false;

        if (chatType === "private") {
          // Convert message array into privateMessages structure based on partnerId
          const myInfo = JSON.parse(localStorage.getItem("myInfo"));
          const currentUserId = myInfo?.id;

          if (messages.length > 0) {
            const partnerId =
              messages[0].senderId === currentUserId
                ? messages[0].receiverId
                : messages[0].senderId;

            state.privateMessages[partnerId] = messages;
          } else {
            state.privateMessages[chatId] = []; // If no messages
          }
        } else {
          state.groupMessages[chatId] = messages;
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // ▶️ Create Group
      .addCase(createGroup.pending, (state) => {
        state.groupLoading = true;
        state.groupError = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.groupLoading = false;
        state.groups.push(action.payload);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.groupLoading = false;
        state.groupError = action.payload;
      })

      // ▶️ Add Group Member
      .addCase(addGroupMember.pending, (state) => {
        state.groupLoading = true;
        state.groupError = null;
      })
      .addCase(addGroupMember.fulfilled, (state, action) => {
        state.groupLoading = false;
        const { groupId, userId } = action.payload;
        if (!state.groupMembers[groupId]) {
          state.groupMembers[groupId] = [];
        }
        state.groupMembers[groupId].push(userId);
      })
      .addCase(addGroupMember.rejected, (state, action) => {
        state.groupLoading = false;
        state.groupError = action.payload;
      })

      // ▶️ Get Group Members
      .addCase(getGroupMembers.pending, (state) => {
        state.groupLoading = true;
        state.groupError = null;
      })
      .addCase(getGroupMembers.fulfilled, (state, action) => {
        state.groupLoading = false;
        const { groupId, members } = action.payload;
        state.groupMembers[groupId] = members;
      })
      .addCase(getGroupMembers.rejected, (state, action) => {
        state.groupLoading = false;
        state.groupError = action.payload;
      })

      // ▶️ Get All Groups
      .addCase(getAllGroups.pending, (state) => {
        state.groupLoading = true;
        state.groupError = null;
      })
      .addCase(getAllGroups.fulfilled, (state, action) => {
        state.groupLoading = false;
        state.groups = action.payload;
      })
      .addCase(getAllGroups.rejected, (state, action) => {
        state.groupLoading = false;
        state.groupError = action.payload;
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
