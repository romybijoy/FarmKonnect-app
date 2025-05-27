import { useState, useEffect } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import FormContainer from "../../components/Form/FormContainer";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../../redux/slices/UsersApiSlice";
import { toast } from "react-toastify";
import { resetPassword } from "../../redux/slices/UserSlice";

import "../../styles/verifyOtp.css";

const ResetPassword = () => {

  const useQuery = () => new URLSearchParams(useLocation().search);

  const query = useQuery();
  const email  = query.get("email");

  console.log(email)
  // const [emailId, setEmail] = useState(email);
  const [newPassword, setNewPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const { user, error, loading } = useSelector((state) => state.app);



  useEffect(() => {

   
  }, []);

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
    <FormContainer>
      <h1>Reset Password</h1>

      <Form>
        <Form.Group className="my-2" controlId="email">
          <Form.Control
            type="email"
            placeholder= {email}
            value={email}
            // onChange={(e) => setEmail(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group className="my-2" controlId="newPassword">
          <Form.Control
            type="password"
            placeholder="Enter New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>

        {/* <div className="countdown-text">
         

          {/* Button to resend OTP */}
        {/* <Button

            style={{
              color: "#FF5630",
            }}
            onClick={resendOTP}
          >
            Resend OTP
          </Button>
        </div>  */}

        {/* Button to submit OTP */}
        <Button className="submit-btn" onClick={submitHandler}>
          SUBMIT
        </Button>
      </Form>
    </FormContainer>
  );
};

export default ResetPassword;
