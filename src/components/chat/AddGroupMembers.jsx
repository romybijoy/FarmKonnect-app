import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addGroupMember } from "../../redux/slices/ChatSlice";
import { fetchFollowing } from "../../redux/slices/FollowSlice";
import { toast } from "react-toastify";

const AddGroupMembers = ({ groupId, existingMembers = [], onClose }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  const dispatch = useDispatch();
  const { following } = useSelector((state) => state.follow);

  useEffect(() => {
    const me = JSON.parse(localStorage.getItem("myInfo"));
    if (me?.id) {
      dispatch(fetchFollowing(me.id));
    }
  }, [dispatch]);

  // 🔒 Prevent adding existing members
  const availableUsers = useMemo(() => {
    const existingIds = new Set(existingMembers);
    return following.filter((user) => !existingIds.has(user.id));
  }, [following, existingMembers]);

  const handleAddMember = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    try {
      await dispatch(
        addGroupMember({ groupId, userId: selectedUser }),
      ).unwrap();

      toast.success("Member added successfully!");
      setSelectedUser(null);
      onClose(); //   close modal
    } catch (err) {
      toast.error("Failed to add member");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Add Group Member</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        {/* User List */}
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
          {availableUsers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">
              No users available to add
            </p>
          ) : (
            availableUsers.map((user) => (
              <label
                key={user.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="radio"
                  name="selectedUser"
                  value={user.id}
                  checked={selectedUser === user.id}
                  onChange={() => setSelectedUser(user.id)}
                />
                <span>{user.username}</span>
              </label>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleAddMember}
            className="bg-[#689F38] text-white hover:opacity-90 px-4 py-2 rounded"
            disabled={!selectedUser}
          >
            Add Member
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGroupMembers;
