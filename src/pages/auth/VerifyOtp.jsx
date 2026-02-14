import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { verifyOTP, regenerateOTP } from "../../redux/slices/UserSlice";

const OtpVerification = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const purpose = location.state?.purpose;
  const initialEmail = location.state?.email || "";

  const { user } = useSelector((state) => state.app);

  const [email, setEmail] = useState(initialEmail || user?.email || "");
  const isFromRegister = purpose === "register";

  const [otpSent, setOtpSent] = useState(isFromRegister);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(0);

  // OTP Countdown
  useEffect(() => {
    let interval;
    if (otpSent) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds((prev) => prev - 1);
        } else if (minutes > 0) {
          setMinutes((prev) => prev - 1);
          setSeconds(59);
        } else {
          clearInterval(interval);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [seconds, minutes, otpSent]);

  // Handle OTP input
  const handleChange = (index, event) => {
    const newOtp = [...otp];
    newOtp[index] = event.target.value.substring(0, 1);
    setOtp(newOtp);
    if (event.target.value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const sendOtpHandler = () => {
    if (!email) {
      toast.error("Please enter an email.");
      return;
    }
    dispatch(
      regenerateOTP({ email, isUpdateEmail: true, currentEmail: initialEmail }),
    );
    setOtpSent(true);
    setMinutes(1);
    setSeconds(0);
    toast.success("OTP sent to " + email);
  };

  const resendOTP = () => {
    dispatch(
      regenerateOTP({ email, isUpdateEmail: true, currentEmail: initialEmail }),
    );
    setMinutes(1);
    setSeconds(0);
    toast.info("OTP resent to " + email);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (otp.some((d) => d === "")) {
      toast.error("Please enter full OTP.");
      return;
    }
    const isUpdateEmail = purpose === "emailEdit";

    const otpString = otp.join("");

    dispatch(
      verifyOTP({
        currentEmail: initialEmail,
        otp: otpString,
        isUpdateEmail,
        newEmail: email,
      }),
    )
      .unwrap()
      .then(() => {
        toast.success("Email verified successfully!");

        if (isUpdateEmail) {
          localStorage.setItem("emailOtpVerified", "true");
          localStorage.setItem("verifiedEmail", email);
          navigate("/profile", {
            state: { openEditModal: true, verifiedEmail: email },
          });
        } else {
          navigate("/login");
        }
      })
      .catch((err) => {
        toast.error(err?.message || "OTP verification failed");
      });
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
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white/20 backdrop-blur-md p-6 rounded-lg shadow-lg w-96 text-center">
          <h2 className="text-white text-2xl font-semibold mb-4">
            {isFromRegister
              ? "Verify OTP"
              : otpSent
                ? "Verify OTP"
                : "Edit & Verify Email"}
          </h2>

          {/* Email Input */}
          <input
            type="email"
            className="w-full mb-4 px-3 py-2 rounded text-gray-900"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={otpSent}
          />

          {/* OTP Input */}
          {otpSent && (
            <>
              <p className="text-white text-sm mb-4">
                Enter the 6-digit OTP sent to your email
              </p>
              <div className="flex justify-center gap-2 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleChange(index, e)}
                    className="w-10 h-10 text-center text-xl font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/40 text-gray-900"
                    maxLength="1"
                  />
                ))}
              </div>
            </>
          )}

          {/* Action Buttons */}
          {!otpSent ? (
            <button
              className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded"
              onClick={sendOtpHandler}
            >
              Send OTP
            </button>
          ) : (
            <button
              className="mt-4 bg-green-400 hover:bg-green-500 text-black font-bold py-2 px-4 rounded"
              onClick={submitHandler}
            >
              Verify OTP
            </button>
          )}

          {/* Countdown */}
          {otpSent && (
            <div className="mt-3 text-white">
              {seconds > 0 || minutes > 0 ? (
                <p>
                  Time Remaining:{" "}
                  <strong>
                    {minutes < 10 ? `0${minutes}` : minutes}:
                    {seconds < 10 ? `0${seconds}` : seconds}
                  </strong>
                </p>
              ) : (
                <p>Didn't receive OTP?</p>
              )}
              <button
                onClick={resendOTP}
                disabled={seconds > 0 || minutes > 0}
                className="text-red-300 hover:text-red-500 font-semibold mt-1"
              >
                Resend OTP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
