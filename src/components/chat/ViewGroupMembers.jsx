import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMembers } from "../../redux/slices/ChatSlice";

const ViewGroupMembers = ({ memberIds, onClose }) => {
  const dispatch = useDispatch();
  const { members, mbrsLoading, mbrsError } = useSelector(
    (state) => state.chat
  );

  useEffect(() => {
    if (memberIds?.length > 0) {
      const userIds = memberIds.map((m) => m.userId);
      dispatch(getMembers(userIds));
    }
  }, [dispatch, memberIds]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">Group Members</h2>
        {mbrsLoading ? (
          <p>Loading...</p>
        ) : mbrsError ? (
          <p className="text-red-500">{mbrsError}</p>
        ) : (
          <ul>
            {members.map((user) => (
              <li key={user.id} className="border-b py-2">
                <div className="flex items-center gap-3">
                  <img
                    src={user.profilePicture || "/profile.png"}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-[#689F38] text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewGroupMembers;
