import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Image } from "react-bootstrap";
import { Camera } from "lucide-react";
import { Firebase } from "../../firebase/config";
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/slices/UserSlice";
import { toast } from "react-toastify";

const EditProfileModal = ({ show, handleClose, user }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    mobile_number: "",
    description: "",
    district: "",
    image: "",
  });

  const [previewImage, setPreviewImage] = useState("");

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
      setPreviewImage(user.image || "");
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const storageRef = Firebase.storage().ref(`/image/user/${file.name}`);
      const snapshot = await storageRef.put(file);
      const url = await snapshot.ref.getDownloadURL();

      setPreviewImage(url);
      setFormData((prev) => ({
        ...prev,
        image: url,
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
  };

  const handleSubmit = async () => {
    try {
      console.log("Submitting formData:", formData);
      await dispatch(updateUser({ data: formData, userId: user.id })).unwrap();
      toast.success("Profile updated!");
      handleClose();
    } catch (err) {
      console.error("Update failed:", err);
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
              className="position-absolute bottom-0 end-0 bg-dark bg-opacity-75 p-2 rounded-circle cursor-pointer"
              onClick={() => fileInputRef.current.click()}
              style={{ transform: "translate(25%, 25%)" }}
            >
              <Camera className="text-white" size={16} />
            </div>
            <input
              type="file"
              accept="image/*"
              className="d-none"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        </div>

        <Form>
          <Form.Group className="mb-3" controlId="formUserName">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              name="userName"
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
