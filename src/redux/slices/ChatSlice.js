import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { appConfig } from "../../config";
import { fetchWithAuth } from "../../service/FetchService";

const token = localStorage.getItem("token");

const ip = `${appConfig.ip}/api`;

export const sendChatMessage = createAsyncThunk(
  "sendChatMessage",
  async (data, { rejectWithValue, fulfillWithValue, getState }) => {
    const state = getState();
    const userId = state.auth?.userInfo?.userId;
    const input = {
      senderId: userId,
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
  },
);

//read action
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async ({ chatId, chatType, ip }, { thunkAPI, getState }) => {
    try {
      const state = getState();
      const userId = state.auth?.userInfo?.userId;
      const endpoint =
        chatType === "group"
          ? `${ip}/api/chat/history/group/${chatId}`
          : `${ip}/api/chat/history/private?receiverId=${chatId}&senderId=${userId}`;

      const response = await fetchWithAuth(endpoint, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();

      return { chatId, chatType, messages: data };
    } catch (error) {
      return thunkAPI.rejectWithValue({ message: error.message });
    }
  },
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
  },
);

export const addGroupMember = createAsyncThunk(
  "group/addMember",
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${ip}/chat/groups/${groupId}/members`, {
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
  },
);

export const getGroupMembers = createAsyncThunk(
  "group/getGroupMembers",
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
  },
);

export const getAllGroups = createAsyncThunk(
  "group/getAll",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${ip}/chat/groups/user/${userId}`);

      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.message || "Failed to fetch groups");
      }

      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  },
);

export const getMembers = createAsyncThunk(
  "group/getMembers",
  async (ids, { rejectWithValue }) => {
    try {
      const response = await fetch(`${appConfig.ip}/user/multiple`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch group members");
      }

      const data = await response.json();
      return data; // should be an array of user details
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

/**
 * Thunk: fetch group metadata by id
 * Expected server response: { id, name, avatar, description?, memberIds: [id,...], ... }
 */
export const getGroupById = createAsyncThunk(
  "groups/getById",
  async (groupId, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${ip}/chat/groups/${groupId}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to fetch group ${groupId}: ${res.status} ${text}`,
        );
      }
      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch group");
    }
  },
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
    groups: [], // All groups
    groupMembers: {},
    groupLoading: false,
    groupError: null,
    members: [],
    mbrsLoading: false,
    mbrsError: null,
    selectedChatId: null,
    selectedType: null,
    conversationsMap: {},
    conversations: [],
    byId: {},
    currentUserId: null,
  },

  reducers: {
    receiveChatMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    setCurrentUserId: (state, action) => {
      state.currentUserId = action.payload;
    },

    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setSelectedChat: (state, action) => {
      state.selectedChatId = action.payload.chatId;
      state.selectedType = action.payload.type;
    },
    // For private 1-on-1 messages
    addMessage: (state, action) => {
      const { message, currentUserId } = action.payload;
      console.log("Received message:", message);
      console.log(action.payload);

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
        (msg) => msg.id === message.id,
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

    // For setting conversations list
    upsertConversationFromMessage: (state, action) => {
      const { message, currentUserId, usersMap } = action.payload;
      console.log(action.payload);

      const { senderId, receiverId, groupId, content, type, timestamp } =
        message;

      // 1️Determine conversation ID
      const isGroup = !!groupId;
      const convId = isGroup
        ? groupId
        : senderId === currentUserId
          ? receiverId
          : senderId;

      // Determine display name + avatar
      let name = "";
      let avatar = "";

      if (isGroup) {
        const group = usersMap[groupId]; // if you store groups separately
        name = group?.name || "Group Chat";
        avatar = group?.image || "/profile.png";
      } else {
        const otherUserId = senderId === currentUserId ? receiverId : senderId;
        const user = usersMap[otherUserId];
        console.log(user);
        name = user?.name || "Unknown User";
        avatar = user?.image || "/profile.png";
      }

      const existing = state.conversationsMap[convId];

      // unread logic (local only)
      const isIncoming = senderId !== currentUserId;
      const unreadCount = existing
        ? existing.unreadCount + (isIncoming ? 1 : 0)
        : isIncoming
          ? 1
          : 0;

      // Determine preview last message text
      const previewText =
        type === "IMAGE" ? "📷 Photo" : content || "New message";

      // Build preview object
      const preview = {
        id: convId,
        username: name,
        profilePicture: avatar,
        lastMessage: previewText,
        lastMessageTime: timestamp,
        unreadCount,
        isGroup,
      };

      // 6️⃣ Save to Map
      state.conversationsMap[convId] = preview;

      // 7️⃣ Build sorted preview list
      state.conversations = Object.values(state.conversationsMap).sort(
        (a, b) =>
          new Date(b.lastMessageTime).getTime() -
          new Date(a.lastMessageTime).getTime(),
      );
    },

    markConversationRead: (state, action) => {
      const convId = action.payload;
      if (state.conversationsMap[convId]) {
        state.conversationsMap[convId].unreadCount = 0;
      }

      state.conversations = Object.values(state.conversationsMap).sort(
        (a, b) =>
          new Date(b.lastMessageTime).getTime() -
          new Date(a.lastMessageTime).getTime(),
      );
    },
    upsertMessage: (state, action) => {
      const message = action.payload;
      const currentUserId = state.currentUserId;

      // GROUP
      if (message.groupId) {
        const old = state.groupMessages[message.groupId] || [];

        const optimisticIndex = old.findIndex(
          (m) =>
            m.optimistic &&
            m.senderId === message.senderId &&
            m.content === message.content &&
            m.type === message.type,
        );

        if (optimisticIndex !== -1) {
          old[optimisticIndex] = message; // replace temp with real
          state.groupMessages[message.groupId] = [...old];
          return;
        }
        const exists = old.some((m) => m.id === message.id);

        state.groupMessages[message.groupId] = exists
          ? old.map((m) => (m.id === message.id ? message : m))
          : [...old, message];
        return;
      }

      // PRIVATE
      const chatId =
        message.senderId === currentUserId
          ? message.receiverId
          : message.senderId;

      const old = state.privateMessages[chatId] || [];

      const optimisticIndex = old.findIndex(
        (m) =>
          m.optimistic &&
          m.senderId === message.senderId &&
          m.content === message.content &&
          m.type === message.type,
      );

      if (optimisticIndex !== -1) {
        old[optimisticIndex] = message;
        state.privateMessages[chatId] = [...old];
        return;
      }
      const exists = old.some((m) => m.id === message.id);

      state.privateMessages[chatId] = exists
        ? old.map((m) => (m.id === message.id ? message : m))
        : [...old, message];
    },

    upsertGroupMessage: (state, action) => {
      const msg = action.payload;
      const groupId = msg.groupId;

      const list = state.groupMessages[groupId] || [];
      const index = list.findIndex((m) => m.id === msg.id);

      if (index !== -1) {
        list[index] = msg; // 🔥 delete/edit
      } else {
        list.push(msg); // 🔥 new
      }

      state.groupMessages[groupId] = list;
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
      })
      .addCase(getMembers.pending, (state) => {
        state.mbrsLoading = true;
        state.mbrsError = null;
      })
      .addCase(getMembers.fulfilled, (state, action) => {
        state.mbrsLoading = false;
        state.members = action.payload;
      })
      .addCase(getMembers.rejected, (state, action) => {
        state.mbrsLoading = false;
        state.mbrsError = action.payload;
      })
      .addCase(getGroupById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGroupById.fulfilled, (state, action) => {
        const group = action.payload;
        if (group && group.id) {
          state.byId[group.id] = {
            ...(state.byId[group.id] || {}),
            ...group,
          };
        }
        state.loading = false;
      })
      .addCase(getGroupById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      });
  },
});

export const {
  receiveChatMessage,
  addMessage,
  addGroupMessage,
  setPrivateMessages,
  setGroupMessages,
  setSelectedChat,
  upsertConversationFromMessage,
  markConversationRead,
  upsertMessage,
  upsertGroupMessage,
  setCurrentUserId,
} = chatDetail.actions;

export const selectGroupById = (state, id) => state.groups?.byId?.[id] || null;

export default chatDetail.reducer;
