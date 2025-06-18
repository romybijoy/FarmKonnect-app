import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFollowers } from '../../../redux/slices/FollowSlice';
import FollowButton from '../../follow/FollowButton';
import NoFollowers from './NoFollowers';

export default function FollowersList({ profileUserId, viewerId }) {
  const dispatch = useDispatch();
  const { followers, globalLoading } = useSelector(state => state.follow);
 

  useEffect(() => {
    dispatch(fetchFollowers(profileUserId));
  }, [dispatch, profileUserId]);

  if (globalLoading) return <p>Loading...</p>;

  if (followers.length == 0)
    return <NoFollowers/>;
console.log(followers)
  return (
    <div>
      <h4>Followers</h4>
      {followers.map(user => (
        <div key={user.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <img src={user.profileImageUrl} alt="" style={{ width: 50, height: 50, borderRadius: '50%' }} />
          <div style={{ marginLeft: '10px', flex: 1 }}>
            <div>{user.username}</div>
            <div style={{ fontSize: 'small', color: 'gray' }}>{user.description}</div>
          </div>
          {viewerId !== user.id && (
            <FollowButton viewerId={viewerId} targetUserId={profileUserId} />
          )}
        </div>
      ))}
    </div>
  );
}
