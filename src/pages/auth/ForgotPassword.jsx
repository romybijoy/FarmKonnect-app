import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import FormContainer from "../../components/Form/FormContainer";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../../redux/slices/UsersApiSlice";
import { toast } from "react-toastify";
import { forgotPassword } from "../../redux/slices/UserSlice";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submitHandler = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessage("A password reset link has been sent to your email.");
    }, 2000);
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75"
      style={{
        backgroundImage:
          "url('/background_img.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
    <div className="flex items-center justify-center h-screen bg-gradient-to-t from-pink-200 to-green-500 h-50">
      {/* Card Container */}
      <div className="bg-white/20 backdrop-blur-md p-6 rounded-lg shadow-lg w-96 text-center">
        <h1 className="text-white text-2xl font-semibold mb-4">Forgot Password</h1>

        {/* Email Input */}
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-400 rounded-lg py-2 px-4 bg-white/40 text-black focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        {/* Submit Button */}
        <button
          onClick={submitHandler} style={{ backgroundColor: "#9AB106", color: "black" }}
          className="mt-4 w-full transition-all text-black font-bold py-2 px-6 rounded-lg shadow-md"
        >
          SUBMIT
        </button>

        {/* Status Message */}
        <div className="mt-3 text-white">
          {loading ? <p>Loading...</p> : <p>{message}</p>}
        </div>
      </div>
    </div>
    </div>
  );
};

export default ForgotPassword;