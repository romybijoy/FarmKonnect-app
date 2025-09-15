import React, { useEffect, useState } from "react";
import { fetchFollowing } from "../../redux/slices/FollowSlice";
import { getAllGroups, setSelectedChat } from "../../redux/slices/ChatSlice";
import { useDispatch, useSelector } from "react-redux";
import { PlusIcon } from "@heroicons/react/24/outline";
import CreateGroupModal from "./CreateGroupModal";
import { createGroup } from "../../redux/slices/ChatSlice";
import { toast } from "react-toastify";

export default function ChatSidebar({ selectedChat, chatType, onSelectChat, onChatsLoaded }) {
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const me = JSON.parse(localStorage.getItem("myInfo")) || [];
  const [selectedUsers, setSelectedUsers] = useState(() =>
    me?.id ? [me.id] : []
  );
  const dispatch = useDispatch();
  const selectedChatId = useSelector((state) => state.chat.selectedChatId);
  const selectedType = useSelector((state) => state.chat.selectedType);
  const { following, globalLoading } = useSelector((state) => state.follow);
  const { groups, groupLoading } = useSelector((state) => state.chat);

  useEffect(() => {
    if (me?.id) {
      dispatch(fetchFollowing(me.id));
      dispatch(getAllGroups(me.id));
    }
  }, [dispatch, me?.id]);

  useEffect(() => {
    if (following?.length > 0) {
      const firstUser = following[0];
      if (!selectedChatId && !selectedType) {
        // setSelectedChatId(firstUser.id);
        // setSelectedType("private");
        onSelectChat(firstUser, "private");
      }

      onChatsLoaded?.(following);
    }
  }, [following]);

  // const groups = [
  //   { id: "1", username: "Group Alpha" },
  //   { id: "2", username: "Project Squad" },
  // ];

  const handleSelect = (chat, type) => {
    dispatch(setSelectedChat({ chatId: chat.id, type }));
    onSelectChat(chat, type);
  };

  const handleCreateGroup = (groupData) => {
    dispatch(createGroup(groupData))
      .unwrap()
      .then((res) => {
        console.log("Group created:", res);
        toast.success("Group created successfully!");
        setShowCreateGroupModal(false);
        setGroupName("");
        setSelectedUsers([]);
      })
      .catch((err) => {
        console.error("Group creation failed:", err);
        toast.error("Failed to create group: " + err);
      });
  };

  const isSelected = (id,type) => selectedChat?.id === id && chatType === type;
  return (
    <div className="w-64 h-full overflow-y-auto bg-white px-3 py-4 border-r font-sans">
      <h2 className="text-lg font-bold text-blue-600 mb-4">Messages</h2>

      <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
        Chats
      </h3>
      {following?.length > 0
        ? following.map((u) => {
            return (
              <div
                key={u.id}
                className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition truncate text-sm
    ${
      isSelected(u.id, "private")
        ? "bg-blue-100 text-blue-700 font-semibold"
        : "hover:bg-blue-50 text-gray-800"
    }
  `}
                onClick={() => handleSelect(u, "private")}
              >
                <img
                  src={u?.profilePicture || "profile.png"}
                  alt={`${u.username || "User"}'s profile`}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="truncate">{u.username}</span>
              </div>
            );
          })
        : Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse" />
              <div className="h-5 w-32 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}

      {/* ==== Groups ==== */}
      <div className="flex items-center mt-3 justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          Groups
        </h3>
        <button
          onClick={() => setShowCreateGroupModal(true)}
          className="p-1 hover:bg-green-100 rounded"
          title="Create Group"
        >
          <PlusIcon className="w-5 h-5 text-green-700" />
        </button>
      </div>
      <div className="space-y-1">
        {groupLoading
          ? Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="h-6 w-32 bg-gray-200 animate-pulse rounded mx-2"
              />
            ))
          : groups.map((g) => (
              <div
                key={g.id}
                onClick={() => handleSelect(g, "group")}
                className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition truncate text-sm
    ${
      isSelected(g.id, "group")
        ? "bg-green-100 text-green-700 font-semibold"
        : "hover:bg-green-50 text-gray-800"
    }
  `}
              >
                <div className="bg-green-500 rounded-full w-9 h-9 flex items-center justify-center text-white text-lg font-bold">
                  {g.name[0]}
                </div>
                <div className="truncate">{g.name}</div>
              </div>
            ))}
      </div>

      {showCreateGroupModal && (
        <CreateGroupModal
          isOpen={showCreateGroupModal}
          onClose={() => setShowCreateGroupModal(false)}
          allUsers={following}
          currentUser={me}
          groupName={groupName}
          setGroupName={setGroupName}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          onCreate={handleCreateGroup}
        />
      )}
    </div>
  );
}
