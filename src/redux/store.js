import { configureStore } from "@reduxjs/toolkit";
import UserSlice from "./slices/UserSlice";
import AuthSlice from "./slices/AuthSlice";
import PostSlice from "./slices/PostSlice";
import { ApiSlice } from "./slices/ApiSlice";

const store = configureStore({
  reducer: {
    [ApiSlice.reducerPath]: ApiSlice.reducer,

    app: UserSlice,
    auth: AuthSlice,
    post: PostSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      ApiSlice.middleware
    ),
  devTools: true,
});

export default store;
