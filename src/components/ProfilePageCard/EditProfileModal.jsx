import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Image } from "react-bootstrap";

const EditProfileModal = ({ show, handleClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    profileImage: "",
  });

  const [previewImage, setPreviewImage] = useState(user?.profileImage || "");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || "",
        profileImage: user.profileImage || "",
      });
      setPreviewImage(user.profileImage);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const handleSubmit = () => {
    onSave(formData);
    handleClose();
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
              src={previewImage || "/default-avatar.png"}
              roundedCircle
              width={100}
              height={100}
              style={{ objectFit: "cover", border: "3px solid #ccc" }}
            />
            <div
              onClick={() => fileInputRef.current.click()}
              className="position-absolute bottom-0 end-0 bg-dark text-white rounded-circle p-1 cursor-pointer"
              style={{ fontSize: "0.7rem" }}
            >
              ✎
            </div>
            <Form.Control
              type="file"
              accept="image/*"
              className="d-none"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </div>
        </div>

        <Form>
          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Your username"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBio">
            <Form.Label>Bio</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="bio"
              value={formData.bio}
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
