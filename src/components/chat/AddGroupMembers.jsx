import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addGroupMember } from "../../redux/slices/ChatSlice";
import { fetchFollowing } from "../../redux/slices/FollowSlice";
import { toast } from "react-toastify";

const AddGroupMembers = ({ groupId, existingMembers }) => {
  const [selectedUser, setSelectedUser] = useState(null); // Only one user
  const { following } = useSelector((state) => state.follow);
  const dispatch = useDispatch();

  useEffect(() => {
    const me = JSON.parse(localStorage.getItem("myInfo"));
    if (me?.id) {
      dispatch(fetchFollowing(me.id));
    }
  }, [dispatch]);

  const handleAddMember = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    try {
      await dispatch(addGroupMember({ groupId, userId: selectedUser })).unwrap();
      toast.success("Member added successfully!");
      setSelectedUser(null);
    } catch (err) {
      toast.error("Failed to add member");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="font-bold text-lg">Add a Member</h3>

        <div className="flex flex-col gap-2 mt-4 max-h-60 overflow-y-auto">
          {following.map((user) => (
            <label key={user.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="selectedUser"
                value={user.id}
                checked={selectedUser === user.id}
                onChange={() => setSelectedUser(user.id)}
              />
              <span>{user.username}</span>
            </label>
          ))}
        </div>

        <button
          onClick={handleAddMember}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={!selectedUser}
        >
          Add Member
        </button>
      </div>
    </div>
  );
};

export default AddGroupMembers;
