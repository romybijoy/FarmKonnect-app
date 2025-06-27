import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Image } from "react-bootstrap";
import { Camera } from "lucide-react";
import { Firebase } from "../../firebase/config";
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/slices/UserSlice"; 
import { toast } from "react-toastify";

const EditProfileModal = ({ show, handleClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    mobile_number: "",
    description: "",
    district: "",
    image: "",
  });

  const [previewImage, setPreviewImage] = useState(user?.image || "");
  const fileInputRef = useRef(null);
const dispatch = useDispatch();
  useEffect(() => {
    if (user) {
      setFormData({
        userName: user.name || "",
        email: user.email || "",
        mobile_number: user.mobile_number || "",
        description: user.description || "",
        district: user.district || "",
        image: user.image || "",
      });
      setPreviewImage(user.image);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = Firebase.storage().ref(`/image/user/${file.name}`);

    storageRef
      .put(file)
      .then((snapshot) => {
        return snapshot.ref.getDownloadURL();
      })
      .then((url) => {
        setPreviewImage(url);
        setFormData((prev) => ({
          ...prev,
          image: url,
        }));
        console.log("Firebase Image URL:", url);
      })
      .catch((error) => {
        console.error("Error uploading image:", error);
      });
  };

  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const imageUrl = URL.createObjectURL(file);
  //   setPreviewImage(imageUrl);

  //   // Pass to parent for upload
  //   onImageChange && onImageChange(file);
  // };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    setFormData((prev) => ({
      ...prev,
      profileImage: file,
    }));
  };

  const handleSubmit = async () => {
  try {
    await dispatch(updateUser({data: formData, userId: user.id})).unwrap();
    toast.success("Profile updated!");
    handleClose();
  } catch (err) {
    toast.error("Failed to update profile!");
  }
};

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="text-center mb-3">
          <div className="position-relative d-inline-block">
            <Image
              src={previewImage || "profile.png"}
              roundedCircle
              width={100}
              height={100}
              style={{ objectFit: "cover", border: "3px solid #ccc" }}
            />
            <div
              className="absolute bottom-1 right-1 bg-black bg-opacity-60 p-1.5 rounded-full cursor-pointer hover:bg-opacity-80 transition"
              onClick={() => fileInputRef.current.click()}
            >
              <Camera className="w-4 h-4 text-white" />
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        </div>

        <Form>
          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Your name"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formMobile">
            <Form.Label>Mobile Number</Form.Label>
            <Form.Control
              type="text"
              name="mobile_number"
              value={formData.mobile_number}
              onChange={handleChange}
              placeholder="Your Mobile Number"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formDistrict">
            <Form.Label>District</Form.Label>
            <Form.Control
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="Your District"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formDescription">
            <Form.Label>Bio</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about yourself"
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={handleSubmit}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditProfileModal;
