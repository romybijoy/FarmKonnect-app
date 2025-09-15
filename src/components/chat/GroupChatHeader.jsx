import { useEffect, useState, useRef } from "react";
import { FaEllipsisV } from "react-icons/fa";
import AddGroupMembers from "./AddGroupMembers"; // modal component
import ViewGroupMembers from "./ViewGroupMembers"; // optional: you can create this modal too

const GroupChatHeader = ({ groupInfo }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!groupInfo) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white shadow relative">
      <div className="flex items-center gap-3">
        <div className="bg-green-500 rounded-full w-10 h-10 flex items-center justify-center text-white text-lg font-bold">
          {groupInfo.name[0]}
        </div>
        <div>
          <h2 className="text-lg font-semibold">{groupInfo.name}</h2>
          <p className="text-sm text-gray-500">
            {groupInfo.members.length} members
          </p>
        </div>
      </div>

      {/* Options menu */}
      <div className="relative" ref={dropdownRef}>
        <FaEllipsisV
          className="cursor-pointer"
          title="Options"
          onClick={() => setShowDropdown((prev) => !prev)}
        />
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-20">
            <button
              onClick={() => {
                setShowDropdown(false);
                setShowMembersList(true);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              View Members
            </button>
            <button
              onClick={() => {
                setShowDropdown(false);
                setShowAddMembers(true);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Add Member
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddMembers && (
        <AddGroupMembers
          groupId={groupInfo.id}
          existingMembers={groupInfo.members.map((m) => m.id)}
          onClose={() => setShowAddMembers(false)}
        />
      )}
      {showMembersList && (
        <ViewGroupMembers
          memberIds={groupInfo.members}
          onClose={() => setShowMembersList(false)}
        />
      )}
    </div>
  );
};

export default GroupChatHeader;
