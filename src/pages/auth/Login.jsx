import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Form, Button, Row, Col, Alert } from "react-bootstrap";
import FormContainer from "../../components/Form/FormContainer";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../../redux/slices/UsersApiSlice";
import { setCredentials } from "../../redux/slices/AuthSlice";
import { toast } from "react-toastify";
import Loader from "../../components/Loader/Loader";
import {
  FacebookLoginButton,
  GoogleLoginButton,
} from "react-social-login-buttons";
import img from "../../assets/login_img.jpg";

import { UserAuth } from "../../context/AuthContext";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);
  const role = localStorage.getItem("role");

  const { googleSignIn, dbUserSignIn, user, facebookSignIn } = UserAuth();

  const iconStyle = {
    fontSize: "16px",
    color: "white",
  };

  const circleBtnStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#3b5998", // Facebook blue
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));

      // Use role from response, not localStorage
      const userRole = res.role;

      if (userRole === "ADMIN") {
        setError("Invalid user credentials.");
        return;
      }

      if (userRole === "USER") {
        navigate("/home");
        toast.success("Login successfully");
      }
    } catch (err) {
      setError(err?.data?.message || err.error);
    }
  };

  const handleGoogleSignIn = async () => {
    const { success, error } = await googleSignIn();

    if (!success) {
      setError(error); // show on screen
      return;
    }

    navigate("/home");
  };

  const handleFacebookSignIn = async () => {
    const { success, error } = await facebookSignIn();

    if (!success) {
      setError(error);
      return;
    }

    navigate("/home");
  };

  {
    error && <Alert variant="danger">{error}</Alert>;
  }
  return (
    <section style={{ height: "100vh" }}>
      <Container fluid className="h-100">
        <Row className="align-items-center h-100">
          {/* Left Image */}
          <Col md={6} className="d-none d-md-block">
            <img src={img} alt="Sample" className="img-fluid w-100" />
          </Col>

          {/* Login Form */}
          <Col md={6}>
            <div style={{ maxWidth: "400px", margin: "0 auto" }}>
              {/* Sign in with social media */}
              <div>
                <img
                  className="h-50 w-50 mx-auto"
                  src="/logoo.png"
                  alt="logo"
                />
              </div>
              <div className="text-center mb-3">
                <p className="mb-2">Sign in with</p>
                <div className="d-flex justify-content-center gap-3">
                  {/* Facebook */}
                  <div style={circleBtnStyle} onClick={handleFacebookSignIn}>
                    <i className="fab fa-facebook-f" style={iconStyle}></i>
                  </div>

                  {/* Google */}
                  <div
                    style={{ ...circleBtnStyle, backgroundColor: "#1DA1F2" }}
                    onClick={handleGoogleSignIn}
                  >
                    <i className="fab fa-google" style={iconStyle}></i>
                  </div>
                </div>
              </div>

              {/* Divider with OR */}
              <div className="d-flex align-items-center my-3">
                <div className="flex-grow-1 border-top"></div>
                <span className="mx-2 fw-bold text-muted">Or</span>
                <div className="flex-grow-1 border-top"></div>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
              <Form noValidate validated={validated} onSubmit={submitHandler}>
                <Form.Group className="my-3" controlId="email">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    isInvalid={validated && !/^\S+@\S+\.\S+$/.test(email)}
                  ></Form.Control>
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid email address.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group
                  className="my-3 position-relative"
                  controlId="password"
                >
                  <Form.Label>Password</Form.Label>

                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    isInvalid={validated && password.length < 4}
                  />

                  {/* 👁 Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "38px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>

                  <Form.Control.Feedback type="invalid">
                    Password must be at least 8 characters and contain a digit,
                    lower-case, upper-case letter, and special character
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="flex justify-end mb-3">
                  <Link
                    to="/forgotPassword"
                    className="text-[#689F38] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                {/* </div> */}

                {/* Submit Button */}
                <div className="d-grid">
                  <Button
                    className="text-white bg-[#689F38] hover:bg-[#5a8c30] font-bold py-2 px-4 rounded"
                    size="lg"
                    disabled={isLoading}
                    type="submit"
                  >
                    Login
                  </Button>
                </div>
                {isLoading && <Loader />}
                {/* Register Link */}
                <div className="text-center mt-3">
                  <p className="mb-0">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-danger">
                      Register
                    </Link>
                  </p>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default LoginScreen;
