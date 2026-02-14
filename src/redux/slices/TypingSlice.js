import { createSlice } from "@reduxjs/toolkit";

const TypingSlice = createSlice({
  name: "typing",
  initialState: {
    typingByEmail: {},
  },
  reducers: {
    setTypingStatus: (state, action) => {
      const { senderId, groupId, isTyping, email } = action.payload;

      const chatId = groupId || senderId;

      if (!chatId) return;

      if (isTyping) {
        state.typingByEmail[chatId] = email; // store email or username
      } else {
        delete state.typingByEmail[chatId];
      }
    },
  },
});

export const { setTypingStatus } = TypingSlice.actions;
export default TypingSlice.reducer;
