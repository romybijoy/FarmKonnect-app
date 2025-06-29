import React, { useState } from "react";

export default function ChatSidebar({ onSelectChat }) {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const groups = [
    { id: "1", username: "Group Alpha" },
    { id: "2", username: "Project Squad" },
  ];

  const rawUsers = localStorage.getItem("userList");
  let users = [];

  if (rawUsers && rawUsers !== "undefined") {
    try {
      users = JSON.parse(rawUsers);
    } catch (e) {
      console.error("Invalid JSON in localStorage:", e);
      users = [];
    }
  }

  const handleSelect = (id, type) => {
    setSelectedId(id);
    setSelectedType(type);
    onSelectChat(id, type);
  };

  const isSelected = (id, type) => selectedId === id && selectedType === type;
  console.log(users);
  return (
    <div className="w-64 h-full overflow-y-auto bg-white px-3 py-4 border-r font-sans">
      <h2 className="text-lg font-bold text-blue-600 mb-4">Messages</h2>

      <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
        Chats
      </h3>
      {users?.length > 0
        ? users.map((u) => {
            const isUserSelected = isSelected(u.id, "private");
            const profileImage = u?.image || "profile.png";

            return (
              <div
                key={u.id}
                className="flex items-center gap-3 p-2 rounded-md cursor-pointer transition truncate text-sm
          hover:bg-blue-50 text-gray-800
          ${isUserSelected ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
        "
                onClick={() => handleSelect(u, "private")}
              >
                <img
                  src={profileImage}
                  alt={`${u.name || "User"}'s profile`}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="truncate">{u.name}</span>
              </div>
            );
          })
        : Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse" />
              <div className="h-5 w-32 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}

      {/* <h3 className="text-sm font-semibold text-gray-600 mt-4 mb-2 uppercase tracking-wide">
        Groups
      </h3>
      <div className="space-y-1">
        {groups.map((g) => (
          <div
            key={g.id}
            onClick={() => handleSelect(g.id, "group")}
            className={`p-2 rounded-md cursor-pointer transition truncate text-sm
          ${
            isSelected(g.id, "group")
              ? "bg-green-100 text-green-700 font-semibold"
              : "hover:bg-green-50 text-gray-800"
          }
        `}
          >
            {g.username}
          </div>
        ))}
      </div> */}
    </div>
  );
}
