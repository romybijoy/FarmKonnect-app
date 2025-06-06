import React, { useEffect } from "react";
import Suggestions from "./Suggestions";
import Feed from "./Feed";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showBlockStatus, getProf } from "../redux/slices/UserSlice";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data } = useSelector((state) => state.app);

  const userData = JSON.parse(localStorage.getItem("userInfo"));
  useEffect(() => {

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
  }, [dispatch, navigate, userData.email]);

  return (
    <div className="container-fluid">
      <div className="row vh-100">
        <div className="col-md-6 col-12">
          <Feed />
        </div>
        <div className="col-md-6 col-12">
          <Suggestions />
        </div>
      </div>
    </div>
  );
};

export default Home;
