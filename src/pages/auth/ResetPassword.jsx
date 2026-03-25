import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import FormContainer from "../../components/Form/FormContainer";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../../redux/slices/UsersApiSlice";
import { toast } from "react-toastify";
import { resetPassword } from "../../redux/slices/UserSlice";

const ResetPassword = () => {
  const useQuery = () => new URLSearchParams(useLocation().search);

  const query = useQuery();
  const [email, setEmail] = useState(query.get("email"));
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch(resetPassword({ email: email, newPassword: newPassword }));
      navigate("/login");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
      navigate("/verifyotp");
    }
  };
  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75"
      style={{
        backgroundImage: "url('/background_img.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex items-center justify-center h-screen bg-gradient-to-t from-pink-200 to-green-500 h-50">
        {/* Card Container */}
        <div className="bg-white/20 backdrop-blur-md p-6 rounded-lg shadow-lg w-96 text-center">
          <h1 className="text-white text-2xl font-semibold mb-4">
            Reset Password
          </h1>

          {/* Email Input */}
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-400 rounded-lg py-2 px-4 bg-white/40 text-black focus:outline-none focus:ring-2 focus:ring-blue-300"
          />

          {/* Password Input */}
          <div className="relative mt-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-400 rounded-lg py-2 px-4 bg-white/40 text-black focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="button"
              className="absolute right-4 top-2 text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {/* Submit Button */}
          <button
            onClick={submitHandler}
            style={{ backgroundColor: "#9AB106", color: "black" }}
            className="mt-6 w-full transition-all text-white font-bold py-2 px-6 rounded-lg shadow-md"
          >
            SUBMIT
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
