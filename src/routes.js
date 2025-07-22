import React from "react";
import Home from "./components/home";
import PostUploadModal from "./components/post/PostUploadModal";

const Profile = React.lazy(() => import("./components/Profile/Profile"));
const Login = React.lazy(() => import("./pages/auth/Login"));

const AddPost = React.lazy(() => import("./components/Post/AddPost"));

const ChatApp = React.lazy(() => import("./components/chat/ChatApp"));

const AddStory = React.lazy(() => import("./components/story/AddStory"));

const VideoCallPage = React.lazy(() =>
  import("./components/call/VideoCallPage")
);

const NotificationPanel = React.lazy(() =>
  import("./components/notifications/NotificationPanel")
);

const routes = [
  { path: "/", exact: true, element: Login },
  { path: "/profile", name: "Profile", element: Profile },
  { path: "/home", name: "Home", element: Home },
  { path: "/addPost", name: "Home", element: AddPost },
  { path: "/chat", name: "Users", element: ChatApp },
  { path: "/addStory", name: "Home", element: AddStory },
  { path: "/call/video/:receiverId", element: VideoCallPage },
  { path: "/notifications", element: NotificationPanel },
];

export default routes;
