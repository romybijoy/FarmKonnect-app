import React, { useState } from "react";
// import axios from "axios";
import { toast } from "react-toastify";

const AddGroupMembers = ({ groupId, existingMembers }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);

  // const handleAddMembers = async () => {
  //   try {
  //     await axios.post(`/api/chat/groups/${groupId}/add-members`, selectedUsers);
  //     toast.success("Members added successfully!");
  //     setSelectedUsers([]);
  //   } catch (err) {
  //     toast.error("Failed to add members");
  //   }
  // };

  return (
    <div className="p-4">
      <h3 className="font-bold text-lg">Add Members</h3>
      {/* Replace with your actual user list UI */}
      <div className="flex flex-wrap gap-2 mt-2">
        {allUsers
          .filter((user) => !existingMembers.includes(user.id))
          .map((user) => (
            <label key={user.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={user.id}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedUsers((prev) =>
                    e.target.checked ? [...prev, id] : prev.filter((uid) => uid !== id)
                  );
                }}
              />
              <span>{user.username}</span>
            </label>
          ))}
      </div>
      <button
        onClick={handleAddMembers}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Members
      </button>
    </div>
  );
};


export default AddGroupMembers;