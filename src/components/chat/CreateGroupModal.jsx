import React from "react";
import { Dialog } from "@headlessui/react";
import { UserPlusIcon } from "@heroicons/react/24/outline";

const CreateGroupModal = ({
  isOpen,
  onClose,
  allUsers,
  currentUser,
  groupName,
  setGroupName,
  selectedUsers,
  setSelectedUsers,
  onCreate, // ✅ group creation handler from parent
}) => {
  const handleToggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = () => {
    if (!groupName.trim()) return;

    console.log("selectedUsers before creating group:", selectedUsers);

    const groupData = {
      name: groupName,
      members: [
        { userId: currentUser.id, isAdmin: true },
        ...(Array.isArray(selectedUsers)
          ? selectedUsers
              .filter((id) => id !== currentUser.id)
              .map((id) => ({ userId: id, isAdmin: false }))
          : []),
      ],
      creatorId: currentUser.id,
    };

    console.log("groupData:", JSON.stringify(groupData, null, 2));
    onCreate(groupData); // ✅ Send data to parent
    onClose(); // ✅ Close modal
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed z-50 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-30"
          aria-hidden="true"
        />
        <Dialog.Panel className="bg-white max-w-md w-full p-6 rounded-xl shadow-xl relative z-50">
          <Dialog.Title className="text-lg font-bold mb-4">
            Create Group
          </Dialog.Title>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Group name"
              className="w-full p-2 border rounded-md"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {allUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                    selectedUsers.includes(user.id)
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleToggleUser(user.id)}
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={user.profilePicture}
                      alt={user.username}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{user.name}</span>
                  </div>
                  {selectedUsers.includes(user.id) && (
                    <UserPlusIcon className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Create Group
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CreateGroupModal;
