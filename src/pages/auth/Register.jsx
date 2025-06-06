import React, { useState } from "react";
import { createUser } from "../../redux/slices/UserSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Firebase } from "../../firebase/config";
import FormContainer from "../../components/Form/FormContainer";
import { Container, Card, Alert, Button, Form, Image } from "react-bootstrap";
import Loader from "../../components/Loader/Loader";

import { toast } from "react-toastify";
import { useRef } from "react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile_number: "",
    role: "USER",
    image: "",

  });
  const [image, setImage] = useState("");
  const [validated, setValidated] = useState(false);
  const [valError, setValError] = useState("");

  const navigate = useNavigate();

  const dispatch = useDispatch();
  const inputRef = useRef();
  const { user, message, error, loading } = useSelector((state) => state.app);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    console.log(e.target.files[0]);
    Firebase.storage()
      .ref(`/image/${e.target.files[0].name}`)
      .put(e.target.files[0])
      .then(({ ref }) => {
        ref.getDownloadURL().then((url) => {
          setImage(url);
          console.log(e.target.name, url);
          setFormData({ ...formData, [e.target.name]: url });
        });
      });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const form = e.currentTarget;

  if (!form.checkValidity()) {
    e.stopPropagation();
    setValidated(true);
    return;
  }

  try {
    console.log(formData);

    const res = await dispatch(createUser(formData)); // wait for the response

    // Clear the form
    setFormData({
      name: "",
      email: "",
      password: "",
      mobile_number: "",
      image: "",
    });

    if (res.payload?.status === 409) {
      setValError("User with email already exists !!!");
    } else if (res.payload && !res.payload.error) {
      toast.success("User registered successfully, verify otp");
      navigate("/verifyotp");
    } else {
      setValError("Something went wrong");
    }
  } catch (err) {
    console.error(err);
    setValError("Error submitting form");
  }
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
    <Container className="d-flex justify-content-center">
           <Card style={{ maxWidth: '600px', width: '100%' }} className="p-4 shadow flex items-center justify-center h-screen bg-gradient-to-t from-pink-200 to-green-500 h-50">
             <h2 className="text-center mb-4">Create an account</h2>
      {valError && <Alert variant="danger">{valError}</Alert>}
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Form.Group className="my-2" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            placeholder="Enter name"
            value={formData.name}
            onChange={handleInputChange}
            required
          ></Form.Control>
          <Form.Control.Feedback type="invalid">
            Please enter a name.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="my-2" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleInputChange}
            required
            isInvalid={validated && !/^\S+@\S+\.\S+$/.test(formData.email)}
          ></Form.Control>
          <Form.Control.Feedback type="invalid">
            Please enter a valid email address.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="my-2" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleInputChange}
            required
            isInvalid={validated && formData.password.length < 4}
          ></Form.Control>
          <Form.Control.Feedback type="invalid">
            Please enter a password.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="my-2" controlId="city">
          <Form.Label>Mobile Number</Form.Label>
          <Form.Control
            type="text"
            name="mobile_number"
            placeholder="Enter Mobile number"
            value={formData.mobile_number}
            onChange={handleInputChange}
            required
          ></Form.Control>
          <Form.Control.Feedback type="invalid">
            Please enter a mobile number.
          </Form.Control.Feedback>
        </Form.Group>

      
        <Form.Group className="my-2" controlId="image">
          <Form.Label>Profile Image</Form.Label>
          <br />
         
          <Form.Control
            type="file"
            // accept="image/*"
            multiple
            ref={inputRef}
            name="image"
            required
            isInvalid={validated && image === ""}
            onChange={handleImageChange}
            // style={{ display: 'none' }}
          ></Form.Control>
          <Form.Control.Feedback type="invalid">
            Please upload an image.
          </Form.Control.Feedback>

          <br />
          {image && (
            <div>
              <div>
                <img src={image} width="50px" height="50px" />
              </div>
            </div>
          )}
        </Form.Group>

        <Button type="submit" variant="primary" className="mt-3">
          Submit
        </Button>
      </Form>
        </Card>
      </Container>
      </div>
  );
};

export default Register;