import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FollowButton from "../follow/FollowButton";
import SkeletonSuggestions from "../Skeleton/SkeletonSuggestions";
import { fetchSuggestions } from "../../redux/slices/SuggestionSlice";

function Suggestions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const me = useSelector((state) => state.auth?.userInfo);
  const { items, loading, error } = useSelector((state) => state.suggestions);

  useEffect(() => {
    if (me?.userId) {
      dispatch(fetchSuggestions());
    }
  }, [me?.userId, dispatch]);

  const openProfile = (username) => {
    navigate(`/profile/${username}`);
  };

  if (loading) return <SkeletonSuggestions />;

  return (
    <div className="w-full p-4 bg-white shadow rounded-xl mt-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-700">
          Suggestions for you
        </span>

        <span
          className="text-sm text-[#689F38] cursor-pointer hover:underline"
          onClick={() => navigate("/suggestions")}
        >
          See All
        </span>
      </div>

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => openProfile(item.userName)}
              >
                <img
                  src={item.image || "/profile.png"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {item.userName}
                  </p>

                  {item.mutualFollowersCount > 0 ? (
                    <p className="text-xs text-gray-500">
                      Followed by {item.mutualFollowersCount} farmer
                      {item.mutualFollowersCount > 1
                        ? "s you follow"
                        : " you follow"}
                    </p>
                  ) : (
                    item.district && (
                      <p className="text-xs text-gray-500">
                        From {item.district} district
                      </p>
                    )
                  )}
                </div>
              </div>

              {me?.userId && (
                <FollowButton viewerId={me.userId} targetUserId={item.id} />
              )}
            </div>
          ))}
        </div>
      ) : (
        !error && (
          <p className="text-center text-gray-500 text-sm">
            No suggestions right now
          </p>
        )
      )}
    </div>
  );
}

export default Suggestions;
