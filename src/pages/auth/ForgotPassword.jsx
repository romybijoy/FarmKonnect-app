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
  const dispatch = useDispatch(); 

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await dispatch(forgotPassword({ email })).unwrap();
      setMessage("✅ A password reset link has been sent to your email.");
       navigate("/forgotPassword");
    } catch (err) {
      toast.error(err || "Something went wrong");
    } finally {
      setLoading(false);
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
            Forgot Password
          </h1>

          {/* Email Input */}
          <form onSubmit={submitHandler} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="border px-3 py-2 rounded w-full"
              required
            />

            {/* Submit Button */}
            <button
              type="submit"
              style={{ backgroundColor: "#9AB106", color: "black" }}
              className="mt-4 w-full transition-all text-black font-bold py-2 px-6 rounded-lg shadow-md"
              disabled={loading}
            >
              SUBMIT
            </button>

            {message && <p className="text-green-600 text-sm">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
