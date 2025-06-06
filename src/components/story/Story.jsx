import React, { useState } from "react";
function Story() {
  const [stories, setStories] = useState([
   {
      id: 1,
      username: 'Your Story',
      type: 'add',
      profilePicture: 'https://cdn-icons-png.flaticon.com/512/1828/1828817.png', // a plus icon
    },
    {
      id: 2,
      username: 'john',
      profilePicture: 'https://randomuser.me/api/portraits/men/10.jpg',
    },
    {
      id: 3,
      username: 'sara',
      profilePicture: 'https://randomuser.me/api/portraits/women/12.jpg',
    },
    {
      id: 4,
      username: 'mike',
      profilePicture: 'https://randomuser.me/api/portraits/men/25.jpg',
    },
  ]);

   const handleAddStory = () => {
    alert('Open story upload modal');
    // TODO: Replace this with a real modal or navigation to uploader
  };
  return (
    <div className="flex space-x-4 overflow-x-auto p-2 border rounded-lg bg-white shadow mt-5">
        {stories.map((story) => (
          <div
            key={story.id}
            className="flex flex-col items-center cursor-pointer"
            onClick={story.type === 'add' ? handleAddStory : () => alert(`Open ${story.username}'s story`)}
          >
            <div className={`w-16 h-16 rounded-full p-1 ${story.type === 'add' ? 'border-2 border-blue-400' : 'border-2 border-pink-500'}`}>
              <img
                src={story.profilePicture}
                alt="story"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="text-xs mt-1 text-center">{story.type === 'add' ? 'Your Story' : story.username}</span>
          </div>
        ))}
      </div>
  );
}

export default Story;
