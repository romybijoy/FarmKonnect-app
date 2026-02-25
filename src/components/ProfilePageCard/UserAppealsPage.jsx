import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserAppeals } from "../../redux/slices/AppealSlice";
import { format } from "date-fns";

function UserAppealsPage({userId}) {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.appeals);

  useEffect(() => {
    dispatch(fetchUserAppeals({userId}));
  }, [dispatch, userId]);

  const statusStyles = {
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    APPROVED: "bg-green-100 text-green-700 border-green-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="mt-6">
      {loading && (
        <div className="text-center text-gray-500 py-6">
          Loading appeals...
        </div>
      )}

      {error && (
        <div className="text-center text-red-600 py-6">
          Failed to load appeals
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          You haven't submitted any appeals yet.
        </div>
      )}

      <div className="space-y-4">
        {items.map((appeal) => (
          <div
            key={appeal.id}
            className="bg-white rounded-xl shadow-sm border p-4"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-gray-700">
                Post ID: {appeal.postId}
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full border ${
                  statusStyles[appeal.status] || "bg-gray-100 text-gray-600"
                }`}
              >
                {appeal.status}
              </span>
            </div>

            {/* Appeal Reason */}
            <div className="text-sm text-gray-600 mb-3">
              <strong>Your Appeal:</strong> {appeal.reason}
            </div>

            {/* Dates */}
            <div className="text-xs text-gray-400">
              Submitted:{" "}
              {format(new Date(appeal.createdAt), "dd MMM yyyy, hh:mm a")}
            </div>

            {appeal.status !== "PENDING" && appeal.reviewedAt && (
              <div className="text-xs text-gray-400 mt-1">
                Reviewed:{" "}
                {format(new Date(appeal.reviewedAt), "dd MMM yyyy, hh:mm a")}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserAppealsPage;