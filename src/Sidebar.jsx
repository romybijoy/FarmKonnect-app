import React from 'react'
import { useNavigate } from 'react-router-dom'

function Sidebar() {
    const navigate = useNavigate();

  return (
    <div className='m-4'>
        <div className='d-flex flex-column gap-4'>
            <div className='logo-text'><b> FarmKonnect</b>
                
            </div>

            <div className='sidemenu'><i className="sidemenu_icons bi bi-house-door"></i>Home</div>
            <div className='sidemenu'><i className="sidemenu_icons bi bi-search"></i>Search</div>
            <div className='sidemenu'><i className="sidemenu_icons bi bi-chat-dots"></i>Messages</div>
            <div className='sidemenu'><i className="sidemenu_icons bi bi-bell-fill"></i>Notifications</div>
            <div className='sidemenu'><i className="sidemenu_icons bi bi-plus-square"></i>Create</div>
            <div className='sidemenu'><i className="sidemenu_icons bi bi-people-fill"></i>Groups</div>
            <div className='sidemenu' onClick={()=> {navigate('/profile')}}><i className="sidemenu_icons bi bi-person-circle"></i>Profile</div>
            <div className='sidemenu'><i className="sidemenu_icons bi bi-list"></i>More</div>
        </div>
    </div>
    
  )
}

export default Sidebar
