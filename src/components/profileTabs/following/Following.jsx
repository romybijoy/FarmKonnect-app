import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFollowing } from '../../../redux/slices/FollowSlice';
import FollowButton from '../../follow/FollowButton';
import NoFollowing from './NoFollowing';

export default function FollowingList({ profileUserId, viewerId }) {
  const dispatch = useDispatch();
  const { following, globalLoading } = useSelector(state => state.follow);

  useEffect(() => {
    dispatch(fetchFollowing(profileUserId));
  }, [dispatch, profileUserId]);

  if (globalLoading) return <p>Loading...</p>;

  if (following.length == 0)
      return <NoFollowing/>;
console.log(following)
  return (
    <div>
      <h4>Following</h4>
      {following.map(user => (
        <div key={user.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <img src={user.profilePicture || '/profile.png'} alt="" style={{ width: 50, height: 50, borderRadius: '50%' }} />
          <div style={{ marginLeft: '10px', flex: 1 }}>
            <div>{user.username}</div>
            {/* <div style={{ fontSize: 'small', color: 'gray' }}>{user.description}</div> */}
          </div>
          {viewerId !== user.id && (
            <FollowButton viewerId={viewerId} targetUserId={user.id} />
          )}
        </div>
      ))}
    </div>
  );
}
