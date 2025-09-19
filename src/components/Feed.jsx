import React, { useEffect } from "react";
import Story from "./story/Story";
import Post from "./posts/Post";
import { useDispatch, useSelector } from "react-redux";
import StoryViewer from "../components/story/StoryViewer";
import { showFeed } from "../redux/slices/PostSlice";
import NoPosts from "./posts/NoPosts";
import PostsList from "./posts/PostsList";
function Feed() {
  const [activeUser, setActiveUser] = React.useState(null);
  const dispatch = useDispatch();
  const { posts } = useSelector((state) => state.post);

  useEffect(() => {
    dispatch(showFeed());
  }, [dispatch]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 h-screen flex flex-col">
      {/* Story fixed at top */}
      <div className="flex-shrink-0 pb-5">
        <Story onSelect={(user) => setActiveUser(user)} />
        {activeUser && (
          <StoryViewer user={activeUser} onClose={() => setActiveUser(null)} />
        )}
      </div>

      {/* PostsList scrollable only */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <PostsList posts={posts} />
      </div>
    </div>
  );
}

export default Feed;
