import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import FormContainer from "../../components/Form/FormContainer";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../../redux/slices/UsersApiSlice";
import { toast } from "react-toastify";
import { forgotPassword } from "../../redux/slices/UserSlice";

import "./verifyOtp.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const { user, error, loading, message } = useSelector((state) => state.app)

  useEffect(() => {
    
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch(forgotPassword({ email: email }));
      navigate("/forgotPassword");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
      navigate("/forgotPassword");
    }
  };

 

  return (
    <FormContainer>
      <h1>Forgot Password</h1>

      <Form>
        <Form.Group className="my-2" controlId="email">
          <Form.Control
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          </Button> */}
        {/* </div> */}

        {/* Button to submit email */}
        <Button className="submit-btn" onClick={submitHandler}>SUBMIT</Button>
      </Form>


      <div>
        { loading ? (<p> Loading </p>):<p>{message}</p>}
      </div>
    </FormContainer>
  );
};

export default ForgotPassword;
