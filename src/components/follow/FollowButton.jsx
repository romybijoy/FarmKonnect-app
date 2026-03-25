import React, { useEffect } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  checkFollowStatus,
  followUser,
  unfollowUser,
} from "../../redux/slices/FollowSlice";
import { toast } from "react-toastify";

export default function FollowButton({ viewerId, targetUserId }) {
  const dispatch = useDispatch();
  const isFollowing = useSelector(
    (state) => state.follow.followStatus?.[targetUserId] ?? false,
  );

  const loading = useSelector(
    (state) => state.follow.loading?.[targetUserId] ?? false,
  );
  const error = useSelector(
    (state) => state.follow.error?.[targetUserId] ?? null,
  );

  useEffect(() => {
    if (viewerId && targetUserId) {
      dispatch(checkFollowStatus({ viewerId, targetUserId }));
    }
  }, [viewerId, targetUserId, dispatch]);

  const handleFollow = () => {
    dispatch(followUser({ viewerId, targetUserId }))
      .unwrap()
      .then(() => {
        toast.success("Followed successfully!");
      })
      .catch((err) => {
        toast.error(err || "Failed to follow");
      });
  };

  const handleUnfollow = () => {
    dispatch(unfollowUser({ viewerId, targetUserId }))
      .unwrap()
      .then(() => {
        toast.success("Unfollowed successfully!");
      })
      .catch((err) => {
        toast.error(err || "Failed to unfollow");
      });
  };

  if (viewerId === targetUserId) return null;

  return (
    <div>
      <Button
        variant=""
        onClick={isFollowing ? handleUnfollow : handleFollow}
        disabled={loading}
        style={{ width: "100px" }}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
          isFollowing
            ? "bg-red-500 hover:bg-red-600"
            : "bg-[#689F38] hover:bg-[#5a8c30]"
        }`}
      >
        {loading ? (
          <Spinner size="sm" animation="border" />
        ) : isFollowing ? (
          "Unfollow"
        ) : (
          "Follow"
        )}
      </Button>
      {/* Optional debug message */}
      {/* {error && <div style={{ color: "red", fontSize: "0.8rem" }}>{error}</div>} */}
    </div>
  );
}
