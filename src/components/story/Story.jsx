import React, { useEffect, useState } from "react";
import prof1 from '../../assets/prof1.jpeg'
import prof2 from '../../assets/prof4.jpeg'
import prof3 from '../../assets/prof2.jpeg'
import prof4 from '../../assets/prof3.jpeg'
import { showStory } from "../../redux/slices/StorySlice";
import { useDispatch, useSelector } from "react-redux";
import CreateStoryModal from "./CreateStoryModal";
import { NavLink } from "react-router-dom";
 
function Story({ onSelect }) {
//   const [stories, setStories] = useState([
//   //  {
//     //   id: 1,
//     //   username: 'Your Story',
//     //   type: 'add',
//     //   profilePicture: 'https://cdn-icons-png.flaticon.com/512/1828/1828817.png', // a plus icon
//     // },
//     // {
//     //   id: 2,
//     //   username: 'john',
//     //   profilePicture: 'https://randomuser.me/api/portraits/men/10.jpg',
//     // },
//     // {
//     //   id: 3,
//     //   username: 'sara',
//     //   profilePicture: 'https://randomuser.me/api/portraits/women/12.jpg',
//     // },
//     // {
//     //   id: 4,
//     //   username: 'mike',
//     //   profilePicture: 'https://randomuser.me/api/portraits/men/25.jpg',
//     // },
//     {
//         userId: 1,
//         userName: 'Your Story',
//         type: 'add',
//         profilePic: 'https://cdn-icons-png.flaticon.com/512/1828/1828817.png',
//         stories: [
//           { id: 1, imageUrl: prof1, timestamp: 'Today 9:30 AM' },
//           { id: 2, imageUrl: prof2, timestamp: 'Today 2:10 PM' },
//         ],
//       },
//     {
//         email: "ronysijo@gmail.com",
//         userName: 'Rony',
//         profilePic: prof3,
//         stories: [
//           { id: 1, type: "image", imageUrl: prof4, timestamp: 'Today 9:30 AM' },
//           { id: 2, type: "image", imageUrl: prof4, timestamp: 'Today 2:10 PM' },
//         ],
//       },
//       {
//         email: "alex@gmail.com",
//         userName: 'Alex',
//         profilePic: prof4,
//         stories: [
//            {
//       id: 1,
//       type: "image",
//       imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac",
//       timestamp: "Just now",
//     },
//     {
//       id: 2,
//       type: "video",
//       videoUrl:
//         "https://www.w3schools.com/html/mov_bbb.mp4", // Sample short video
//       timestamp: "1 min ago",
//     },
//     {
//       id: 3,
//       type: "image",
//       imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac",
//       timestamp: "3 min ago",
//     },
//         ],
//       },
//       {
//         email:"ronyrosejimmy@gmail.com",
//   userName: "John Doe",
//   profilePic: "https://i.pravatar.cc/150?img=32",
//   stories: [
//     {
//       id: 1,
//       type: "image",
//       imageUrl: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d",
//       timestamp: "2 hours ago",
//     },
//     {
//       id: 2,
//       type: "video",
//       videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
//       timestamp: "1 hour ago",
//     },
//     {
//       id: 3,
//       type: "image",
//       imageUrl: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d",
//       timestamp: "Just now",
//     },
//   ],
// },


//   ]);

  
    const dispatch = useDispatch();
    const { stories } = useSelector((state) => state.story);
   const handleAddStory = () => {
    <CreateStoryModal/>

    // TODO: Replace this with a real modal or navigation to uploader
  };

  useEffect(() => {
      dispatch(showStory());
    }, [dispatch]);
  return (
    
    <div className="flex space-x-4 overflow-x-auto p-2 border rounded-lg bg-white shadow mt-5">
       <NavLink to="/addStory" className="link-clean">
  <div className="flex flex-col items-center cursor-pointer">
    <div className="w-16 h-16 rounded-full p-1 border-2 border-blue-400">
      <img
        src="https://cdn-icons-png.flaticon.com/512/1828/1828817.png"
        alt="story"
        className="w-full h-full object-cover rounded-full"
      />
    </div>
    <span className="text-xs mt-1 text-center">Your Story</span>
  </div>
</NavLink>
        {stories.map((story) => (
          <div
            key={story.email}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => onSelect(story)}
          >
            <div className="w-16 h-16 rounded-full p-1 border-2 border-pink-500">
              <img
                src={story.profilePic}
                alt="story"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="text-xs mt-1 text-center">{story.userName}</span>
          </div>
        ))}
      </div>
  );
}

export default Story;
