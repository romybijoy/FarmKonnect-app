import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import FormContainer from "../../components/Form/FormContainer";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../../redux/slices/UsersApiSlice";
import { toast } from "react-toastify";
import { verifyOTP, regenerateOTP } from "../../redux/slices/UserSlice";

import "./verifyOtp.css";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(30);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // const [login, { isLoading }] = useLoginMutation();

  // const { userInfo } = useSelector((state) => state.auth);

  const { user, error, loading } = useSelector((state) => state.app);

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

  const resendOTP = () => {
    setMinutes(1);
    setSeconds(60);

    dispatch(regenerateOTP({ email: user.email }));
  };

  return (
    <FormContainer>
      <h1>Verify OTP</h1>

      <Form>
        <Form.Group className="my-2" controlId="otp">
          <Form.Control
            type="otp"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <div className="countdown-text">
          {/* Display countdown timer if seconds or minutes are greater than 0 */}

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
            <p>Didn't receive code?</p>
          )}

          {/* Button to resend OTP */}
          <Button
            disabled={seconds > 0 || minutes > 0}
            style={{
              color: seconds > 0 || minutes > 0 ? "#DFE3E8" : "#FF5630",
            }}
            onClick={resendOTP}
          >
            Resend OTP
          </Button>
        </div>

        {/* Button to submit OTP */}
        <Button className="submit-btn" onClick={submitHandler}>
          SUBMIT
        </Button>
      </Form>
    </FormContainer>
  );
};

export default OtpVerification;
