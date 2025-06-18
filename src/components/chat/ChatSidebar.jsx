import React, { useState } from "react";

export default function ChatSidebar({ onSelectChat }) {

  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const groups = [
    { id: "1", username: "Group Alpha" },
    { id: "2", username: "Project Squad" },
  ];

 const users = JSON.parse(localStorage.getItem("userList")) || [];


  const handleSelect = (id, type) => {
    setSelectedId(id);
    setSelectedType(type);
    onSelectChat(id, type);
  };

  const isSelected = (id, type) => selectedId === id && selectedType === type;
console.log(users)
  return (
    <div className="w-64 h-full overflow-y-auto bg-white px-3 py-4 border-r font-sans">
      <h2 className="text-lg font-bold text-blue-600 mb-4">Messages</h2>

      <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
        Chats
      </h3>
      {users?.length > 0
        ? users.map((u) => (
          
            <div
              key={u.id}
              onClick={() => handleSelect(u.id, "private")}
              className={`p-2 rounded-md cursor-pointer transition truncate text-sm
        ${
          isSelected(u.id, "private")
            ? "bg-blue-100 text-blue-700 font-semibold"
            : "hover:bg-blue-50 text-gray-800"
        }
      `}
            >
              {u.name}
            </div>
          ))
        : // Loading placeholder (skeleton)
          Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="p-2 rounded-md bg-gray-200 animate-pulse h-6 w-32 mb-1"
            ></div>
          ))}

      <h3 className="text-sm font-semibold text-gray-600 mt-4 mb-2 uppercase tracking-wide">
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
      </div>
    </div>
  );
}
