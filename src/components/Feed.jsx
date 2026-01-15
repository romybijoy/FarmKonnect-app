import React, { useEffect } from "react";
import Story from "./story/Story";
import Post from "./posts/Post";
import { useDispatch, useSelector } from "react-redux";
import StoryViewer from "../components/story/StoryViewer";
import { showFeed } from "../redux/slices/PostSlice";
import NoPosts from "./posts/NoPosts";
import PostsList from "./posts/PostsList";
import SkeletonFeed from "./Skeleton/SkeletonFeed";
function Feed() {
  const [activeUser, setActiveUser] = React.useState(null);
  const dispatch = useDispatch();
  const { posts,loading,error  } = useSelector((state) => state.post);
 const userId = useSelector(state => state.auth?.userInfo?.userId);

 useEffect(() => {
  if (userId) {
    dispatch(showFeed(userId));
  }
}, [userId]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 h-screen flex flex-col">
      {/* Story fixed at top */}
      <div className="flex-shrink-0 pb-5">
        <Story onSelect={(user) => setActiveUser(user)} />
        {activeUser && (
          <StoryViewer user={activeUser} onClose={() => setActiveUser(null)} />
        )}
      </div>


      {/* Posts Section */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        
        {loading ? (
          <SkeletonFeed /> 
        ) : (
          <PostsList posts={posts} loading={loading} error={error} isFeed={true} />
        )}

      </div>
    </div>
  );
}

export default Feed;
