import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { IoReorderThreeOutline } from "react-icons/io5";
import {
  BiHomeAlt,
  BiMessageDetail,
  BiUserCircle,
  BiLogOut,
} from "react-icons/bi";
import { FaSearch, FaBell, FaUsers, FaPlusSquare } from "react-icons/fa";
import { logout } from "../redux/slices/AuthSlice";
import { UserAuth } from "../context/AuthContext";
import { useDispatch } from "react-redux";
import { ConfirmModal } from "../components/index";

function Sidebar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, logOut } = UserAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // const handleLogout = async () => {
  //   const confirmDelete = window.confirm("Are you sure you want to logout?");
  //   if (confirmDelete && user != null) {
  //     try {
  //       await logOut();
  //       dispatch(logout());
  //       navigate("/");
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }
  // };

  const confirmLogout = () => setShowLogoutModal(true);

  const performLogout = async () => {
    if (user != null) {
      try {
        await logOut();
      } catch (error) {
        console.error(error);
      }
    }
    dispatch(logout());
    navigate("/");
    setShowLogoutModal(false);
  };

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  const navItemClasses = ({ isActive }) =>
    `flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-150 ${
      isActive
        ? "bg-[#DFF5E1] text-[#4B6F2C] font-medium no-underline"
        : "text-gray-600 hover:bg-[#EDF7EE] no-underline"
    }`;

  return (
    <>
      {/* Mobile Header */}

      <div className="md:hidden justify-between items-center px-4 py-3 shadow bg-white sticky top-0 z-20">
        <img src="/logoo.png" alt="logo" className="h-10 w-10" />
        <button onClick={toggleMobileMenu}>
          <IoReorderThreeOutline size={26} />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
    bg-white shadow-lg h-full h-screen w-64 z-30
    transform transition-transform duration-300 ease-in-out
    fixed top-0 left-0 overflow-y-auto md:h-full md:overflow-y-visible 
    ${
      isMobile
        ? isMobileMenuOpen
          ? "translate-x-0"
          : "-translate-x-full"
        : "md:translate-x-0 md:static md:block"
    }
  
  `}
      >
        {" "}
        <div className="flex flex-col h-full justify-between p-4">
          {/* Close Button - Mobile Only */}
          <div className="justify-end md:hidden mb-2">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              &#10005;
            </button>
          </div>
          {/* Top Section */}
          <div>
            <div className="flex justify-center mb-6">
              <img src="/logoo.png" alt="logo" className="h-20" />
            </div>

            <nav className="space-y-1">
              <NavLink
                to="/home"
                className={navItemClasses}
                onClick={handleNavClick}
              >
                <BiHomeAlt className="text-xl" />
                Home
              </NavLink>
              {/* <div className="flex items-center gap-4 px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100">
                <FaSearch className="text-lg" />
                Search
              </div> */}
              <NavLink
                to="/chat"
                className={navItemClasses}
                onClick={handleNavClick}
              >
                <BiMessageDetail className="text-xl" />
                Messages
              </NavLink>
              <NavLink
                to="/notifications"
                className={navItemClasses}
                onClick={handleNavClick}
              >
                <FaBell className="text-lg" />
                Notifications
              </NavLink>
              <NavLink
                to="/addPost"
                className={navItemClasses}
                onClick={handleNavClick}
              >
                <FaPlusSquare className="text-xl" />
                Create Post
              </NavLink>
              {/* <div className="flex items-center gap-4 px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100">
                <FaUsers className="text-lg" />
                Groups
              </div> */}
              <NavLink
                to="/profile"
                className={navItemClasses}
                onClick={handleNavClick}
              >
                <BiUserCircle className="text-xl" />
                Profile
              </NavLink>
            </nav>
          </div>
          {/* Bottom Section */}
          <div className="border-t pt-4">
            <div
              onClick={toggleDropdown}
              className="flex items-center gap-4 px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <i className="bi bi-list text-xl" />
              More
            </div>

            {showDropdown && (
              <div className="mt-2 bg-white rounded shadow mb-4">
                <button
                  onClick={confirmLogout}
                  className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 flex items-center gap-2"
                >
                  <BiLogOut className="text-lg" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        {showLogoutModal && (
          <ConfirmModal
            title="Confirm Logout"
            message="Are you sure you want to logout?"
            onConfirm={performLogout}
            onCancel={() => setShowLogoutModal(false)}
          />
        )}
      </aside>
    </>
  );
}

export default Sidebar;
