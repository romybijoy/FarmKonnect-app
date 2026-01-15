import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSuggestions } from "../../redux/slices/SuggestionSlice";
import FollowButton from "../../components/follow/FollowButton";
import SkeletonSuggestions from "../../components/Skeleton/SkeletonSuggestions";
import { useNavigate } from "react-router-dom";

function AllSuggestions() {
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

  return (
    // this makes the page fill the space next to sidebar
    <div className="flex-1 flex justify-center">
      {/* main content container */}
      <div className="w-full max-w-3xl px-6 py-10">
        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            People you may know
          </h1>
          {items.length > 0 && (
            <span className="text-sm text-gray-500">
              {items.length} suggestion{items.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loading && <SkeletonSuggestions />}

        {!loading && error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        {/* ✅ NICE EMPTY STATE */}
        {!loading && !error && items.length === 0 && (
          <div className="mt-24 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
              <span className="text-3xl">👋</span>
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-1">
              No suggestions right now
            </p>
            <p className="text-sm text-gray-500 max-w-md">
              Follow a few farmers, update your district, or interact with posts
              to get better people suggestions.
            </p>
          </div>
        )}

        {/* ✅ GRID SO IT DOESN’T FEEL EMPTY WHEN THERE *ARE* RESULTS */}
        {!loading && !error && items.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white shadow-sm border border-gray-100"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => openProfile(item.userName)}
                >
                  <img
                    src={item.image || "/profile.png"}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.userName}
                    </p>

                    {item.mutualFollowersCount > 0 ? (
                      <p className="text-xs text-gray-500">
                        Followed by {item.mutualFollowersCount} farmer
                        {item.mutualFollowersCount > 1 ? "s you follow" : ""}
                      </p>
                    ) : (
                      item.district &&
                      item.district.trim() !== "" && (
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
        )}
      </div>
    </div>
  );
}

export default AllSuggestions;
