import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import FormContainer from "../../components/Form/FormContainer";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../../redux/slices/UsersApiSlice";
import { toast } from "react-toastify";
import { verifyOTP, regenerateOTP } from "../../redux/slices/UserSlice";


const OtpVerification = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(30);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { user, error, loading } = useSelector((state) => state.app);

  const resendOTP = () => {
    setMinutes(1);
    setSeconds(60);

    dispatch(regenerateOTP({ email: user.email }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }

      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(interval);
        } else {
          setSeconds(59);
          setMinutes(minutes - 1);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [seconds]);

  const handleChange = (index, event) => {
    const newOtp = [...otp];
    newOtp[index] = event.target.value.substring(0, 1);
    setOtp(newOtp);

    // Move to next input on typing
    if (event.target.value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch(verifyOTP({ email: user.email, otp: otp }));
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
        {/* OTP Card */}
        <div className="bg-white/20 backdrop-blur-md p-6 rounded-lg shadow-lg w-96 text-center">
          <h2 className="text-white text-2xl font-semibold mb-4">
            OTP Verification
          </h2>
          <p className="text-white text-sm mb-6">
            Enter the 6-digit OTP sent to your email
          </p>

          {/* OTP Inputs */}
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleChange(index, e)}
                className="w-12 h-12 text-center text-xl font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/40 text-gray-900"
                maxLength="1"
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            className="mt-6 bg-yellow-400 hover:bg-yellow-500 transition-all text-black font-bold py-2 px-6 rounded-lg shadow-md"
            onClick={submitHandler}
          >
            Verify OTP
          </button>

          {/* Countdown */}
          <div className="countdown-text">
            {/* Display countdown timer if seconds or minutes are greater than 0 */}
            <br />
            {seconds > 0 || minutes > 0 ? (
              <p>
                Time Remaining:{" "}
                <span style={{ fontWeight: 600 }}>
                  {minutes < 10 ? `0${minutes}` : minutes}:
                  {seconds < 10 ? `0${seconds}` : seconds}
                </span>
              </p>
            ) : (
              // Display if countdown timer reaches 0
              <p>Didn't receive OTP?</p>
            )}

            {/* Button to resend OTP */}
            <button
              disabled={seconds > 0 || minutes > 0}
              style={{
                color: seconds > 0 || minutes > 0 ? "#DFE3E8" : "#FF5630",
                fontWeight: "bold",
              }}
              onClick={resendOTP}
            >
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
