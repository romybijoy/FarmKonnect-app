import React, { useEffect } from "react";
import Story from "./story/Story";
import Post from "./posts/Post";
import { useDispatch, useSelector } from "react-redux";
import StoryViewer from "../components/story/StoryViewer";
import { showPost } from "../redux/slices/PostSlice";
function Feed() {
  const [activeUser, setActiveUser] = React.useState(null);
  const dispatch = useDispatch();
  const { posts } = useSelector((state) => state.post);

  useEffect(() => {
    dispatch(showPost());
  }, [dispatch]);

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <Story onSelect={(user) => setActiveUser(user)} />
          {activeUser && (
            <StoryViewer
              user={activeUser}
              onClose={() => setActiveUser(null)}
            />
          )}
        </div>
        <div className="col-12">
          <Post data={posts} />
        </div>
      </div>
    </div>
  );
}

export default Feed;
