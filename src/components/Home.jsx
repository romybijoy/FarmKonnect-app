import React, { useEffect } from "react";
import Suggestions from "./suggestion/Suggestions";
import Feed from "./Feed";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  showBlockStatus,
  getProf,
  showUser,
  setUsers,
} from "../redux/slices/UserSlice";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data } = useSelector((state) => state.app);

  const userData = JSON.parse(localStorage.getItem("userInfo") || "null");

  useEffect(() => {
    // preload user list
    const cachedUsers = localStorage.getItem("userList");
    if (cachedUsers) {
      dispatch(setUsers(JSON.parse(cachedUsers)));
    } else {
      dispatch(showUser()).then((res) => {
        localStorage.setItem("userList", JSON.stringify(res.payload.content));
      });
    }

    if (!userData?.email) return;

    dispatch(getProf({ email: userData.email }));

    const checkBlockedStatus = async () => {
      try {
        const res = await dispatch(
          showBlockStatus({ email: userData.email })
        ).unwrap();

        if (!res.blocked) {
          alert("You’ve been blocked by the admin.");
          navigate("/"); // or call logout()
        }
      } catch (error) {
        console.error("Error while checking block status:", error);
      }
    };

    checkBlockedStatus();

    // Optional: periodic check
    // const interval = setInterval(checkBlockedStatus, 60000);
    // return () => clearInterval(interval);
  }, [dispatch, navigate, userData?.email]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Feed - scrollable */}
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-2xl mx-auto">
          <Feed />
        </div>
      </main>

      {/* Suggestions - force visible */}
      <aside className="w-[400px] border-l border-gray-200 bg-white">
        <div className="sticky top-0 h-screen p-4 overflow-y-auto">
          <Suggestions />
        </div>
      </aside>
    </div>
  );
};

export default Home;
