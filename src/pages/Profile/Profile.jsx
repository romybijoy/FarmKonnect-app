import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import ProfilePostsPart from '../../Components/ProfilePageCard/ProfilePostsPart'
import UserDetailCard from '../../Components/ProfilePageCard/UserDetailCard'
// import { isFollowing, isReqUser } from '../../Config/Logic'
// import { findByUsernameAction, getUserProfileAction } from '../../Redux/User/Action'

const Profile = () => {
  const dispatch=useDispatch();
  const currentUser = localStorage.getItem("userInfo");
  const {username} = useParams();
  const {user}=useSelector(store=>store);

  // const isRequser=isReqUser(user.reqUser?.id,user.findByUsername?.id);
  // const isFollowed=isFollowing(user.reqUser,user.findByUsername);
  // console.log(user)

  // const { currentUser } = useSelector((state) => state.app);


  console.log(currentUser);
    return (
    <div className='px-20'>
        <div>
            <UserDetailCard user={currentUser} />
        </div>
        <div>
            <ProfilePostsPart user={currentUser}/>
        </div>
    </div>
  )
}

export default Profile