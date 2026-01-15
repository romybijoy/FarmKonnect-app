import React from "react";

export const Home = React.lazy(() => import("./components/home"));
export const Profile = React.lazy(() => import("./components/Profile/Profile"));
export const Login = React.lazy(() => import("./pages/auth/Login"));

export const AddPost = React.lazy(() => import("./components/Post/AddPost"));

export const ChatApp = React.lazy(() => import("./components/chat/ChatApp"));

export const AddStory = React.lazy(() => import("./components/story/AddStory"));

export const CallPage = React.lazy(() =>
  import("./components/call/CallPage")
);

export const NotificationPanel = React.lazy(() =>
  import("./components/notifications/NotificationPanel")
);

export const AllSuggestions = React.lazy(() =>
  import("./components/suggestion/AllSuggestions")
);
