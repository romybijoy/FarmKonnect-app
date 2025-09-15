import { configureStore } from "@reduxjs/toolkit";
import UserSlice from "./slices/UserSlice";
import AuthSlice from "./slices/AuthSlice";
import PostSlice from "./slices/PostSlice";
import ChatSlice from "./slices/ChatSlice";
import FollowSlice from "./slices/FollowSlice";
import StorySlice from "./slices/StorySlice";
import NotificationSlice from "./slices/NotificationSlice";
import PresenceSlice from "./slices/PresenceSlice";
import TypingSlice from "./slices/TypingSlice";
import ReactionsSlice from "./slices/ReactionsSlice";
import { ApiSlice } from "./slices/ApiSlice";

const store = configureStore({
  reducer: {
    [ApiSlice.reducerPath]: ApiSlice.reducer,

    app: UserSlice,
    auth: AuthSlice,
    post: PostSlice,
    chat: ChatSlice,
    follow: FollowSlice,
    story: StorySlice,
    notifications: NotificationSlice,
    presence: PresenceSlice,
    typing: TypingSlice,
    reactions: ReactionsSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      ApiSlice.middleware
    ),
  devTools: true,
});

export default store;
