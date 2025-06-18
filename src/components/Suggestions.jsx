import React, { useState } from 'react';
import prof1 from '../assets/prof1.jpeg';
import prof2 from '../assets/prof4.jpeg';
import prof3 from '../assets/prof2.jpeg';
import prof4 from '../assets/prof3.jpeg';
import FollowButton from './follow/FollowButton';

function Suggestions() {
  const users = JSON.parse(localStorage.getItem("userList")) || [];
  const me = JSON.parse(localStorage.getItem("myInfo")) || [];
  const [suggestion, setSuggestion] = useState(users);
    
  //   [
  //   {
  //     id: 1,
  //     user: 'John Doe',
  //     img: prof1,
  //     status: 'Follows you',
  //   },
  //   {
  //     id: 2,
  //     user: 'Alice Bow',
  //     img: prof2,
  //     status: 'Followed by Regha',
  //   },
  //   {
  //     id: 3,
  //     user: 'Manoj',
  //     img: prof3,
  //     status: 'Follows you',
  //   },
  //   {
  //     id: 4,
  //     user: 'Albin Joe',
  //     img: prof4,
  //     status: 'Follows you',
  //   },
  // ]
  // );

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white shadow rounded-xl mt-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-700">Suggestions for you</p>
        <button className="text-sm text-blue-500 hover:underline">See All</button>
      </div>
      {suggestion.length > 0 ? (
        <div className="space-y-4">
          {suggestion.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  {/* <p className="text-xs text-gray-500">{item.status}</p> */}
                </div>
              </div>
              {/* <button className="text-sm text-blue-500 font-semibold hover:underline">Connect</button> */}
              <FollowButton viewerId={me.id} targetUserId={item.id}/>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-sm">Loading...</p>
      )}
    </div>
  );
}

export default Suggestions;
