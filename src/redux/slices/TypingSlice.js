import { createSlice } from "@reduxjs/toolkit";

const TypingSlice = createSlice({
  name: "typing",
  initialState: {
    typingByEmail: {},
  },
  reducers: {
    setTypingStatus: (state, action) => {
      const { email, isTyping, groupId, receiverId } = action.payload;
      const chatId = groupId || receiverId;

      if (!chatId) return;

      if (isTyping) {
        state.typingByEmail[chatId] = email;
      } else {
        delete state.typingByEmail[chatId];
      }
    },
  },
});

export const { setTypingStatus } = TypingSlice.actions;
export default TypingSlice.reducer;
