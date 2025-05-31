import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import "../index.css";
import { IoReorderThreeOutline } from "react-icons/io5";
import { logout } from "../redux/slices/AuthSlice";

import { UserAuth } from "../context/AuthContext";
import { useDispatch } from "react-redux";

function Sidebar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logOut, currentPath } = UserAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch()
  function handleClick() {
    setShowDropdown(!showDropdown);
  }

  const handleLogout = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to logout this user?"
    );
    if (confirmDelete) {
      if (user != null) {
        try {
          await logOut();
        } catch (error) {
          console.log(error);
        }
      }

      dispatch(logout());
      navigate("/");
    }
  };

  return (
    <div className="m-4">
      <div className="d-flex flex-column gap-4">
        {/* <div className='logo-text'><b> FarmKonnect</b>
                
            </div> */}
        <aside className="sidebar fixed-bottom">
          <div className="logo-img">
            <img align="start" src="logoo.png" width={90} height={100} />
          </div>
          <div className="mt-10">
            <div className="sidemenu">
              <NavLink to="/home" className="link-clean">
                <i className="sidemenu_icons bi bi-house-door"></i> Home
              </NavLink>
            </div>
            <div className="sidemenu">
              <i className="sidemenu_icons bi bi-search"></i>Search
            </div>
            <div className="sidemenu">
              <i className="sidemenu_icons bi bi-chat-dots"></i>Messages
            </div>
            <div className="sidemenu">
              <i className="sidemenu_icons bi bi-bell-fill"></i>Notifications
            </div>
            <div className="sidemenu">
              <NavLink to="/addPost" className="link-clean">
              <i className="sidemenu_icons bi bi-plus-square"></i>Create
              </NavLink>
            </div>
            <div className="sidemenu">
              <i className="sidemenu_icons bi bi-people-fill"></i>Groups
            </div>
            <div className="sidemenu">
              <NavLink to="/profile" className="link-clean">
                <i className="sidemenu_icons bi bi-person-circle"></i>Profile
              </NavLink>
            </div>
          </div>
          <div className="relative">
            <div onClick={handleClick} className="sidemenu">
              <i className="sidemenu_icons bi bi-list"></i>More
            </div>
            <div className="position-fixed">
              {showDropdown && (
                <div className="shadow">
                  <button

                    onClick={handleLogout}
                    className="py-2 fs-6 px-4 border-top border-bottom cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Sidebar;
