import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Image } from "react-bootstrap";
import { Camera, CheckCircle2 } from "lucide-react";
import { Firebase } from "../../firebase/config";
import { useDispatch } from "react-redux";
import {
  updateUser,
  verifyOTP,
  regenerateOTP,
} from "../../redux/slices/UserSlice";
import { toast } from "react-toastify";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

// Mask email
const maskEmail = (email) => {
  if (!email) return "";
  const [name, domain] = email.split("@");
  if (name.length <= 2) return email;
  return `${name.slice(0, 2)}****@${domain}`;
};

// Normalize errors
const normalizeError = (err) => {
  const msg = err?.toLowerCase?.() || "";
  if (msg.includes("email")) return "This email is already registered.";
  if (msg.includes("otp") || msg.includes("code"))
    return "Invalid or expired OTP.";
  return err || "Something went wrong";
};

const EditProfileModal = ({ show, handleClose, user }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    mobileNumber: "",
    description: "",
    district: "",
    image: "",
  });

  const [previewImage, setPreviewImage] = useState("");

  const [otpStep, setOtpStep] = useState("idle");
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const otpRefs = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        userName: user.name || "",
        email: user.email || "",
        mobileNumber: user.mobileNumber || "",
        description: user.description || "",
        district: user.district || "",
        image: user.image || "",
      });
      setPreviewImage(user.image || "");
    }
  }, [user]);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  // Auto-submit OTP
  useEffect(() => {
    if (
      otp.join("").length === OTP_LENGTH &&
      otpStep === "input" &&
      !verifying
    ) {
      handleVerifyOtp();
    }
  }, [otp]);

  const startResendTimer = () => {
    setResendTimer(RESEND_COOLDOWN);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const storageRef = Firebase.storage().ref(`/image/user/${file.name}`);
      const snapshot = await storageRef.put(file);
      const url = await snapshot.ref.getDownloadURL();

      setPreviewImage(url);
      setFormData((prev) => ({ ...prev, image: url }));
    } catch {
      toast.error("Failed to upload image");
    }
  };

  const handleSendOtp = () => {
    if (!formData.email || formData.email === user.email) {
      toast.error("Enter a new email to verify");
      return;
    }

    setLoading(true);
    dispatch(
      regenerateOTP({
        email: formData.email,
        isUpdateEmail: true,
        currentEmail: user.email,
      }),
    )
      .unwrap()
      .then(() => {
        setOtpStep("input");
        setOtp(new Array(OTP_LENGTH).fill(""));
        setOtpError("");
        startResendTimer();
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      })
      .catch((err) => toast.error(normalizeError(err)))
      .finally(() => setLoading(false));
  };

  const handleResend = () => {
    if (resendTimer > 0) return;

    dispatch(
      regenerateOTP({
        email: formData.email,
        isUpdateEmail: true,
        currentEmail: user.email,
      }),
    )
      .unwrap()
      .then(() => {
        toast.success("OTP resent!");
        setOtp(new Array(OTP_LENGTH).fill(""));
        startResendTimer();
      })
      .catch((err) => toast.error(normalizeError(err)));
  };

  const handleVerifyOtp = () => {
    const otpString = otp.join("");
    if (otpString.length !== OTP_LENGTH) return;

    setVerifying(true);

    dispatch(
      verifyOTP({
        currentEmail: user.email,
        otp: otpString,
        isUpdateEmail: true,
        newEmail: formData.email,
      }),
    )
      .unwrap()
      .then((res) => {
        // 🔥 IMPORTANT CHECK
        if (res?.statusCode && res.statusCode !== 200) {
          setOtpError(res.message || "Verification failed");
          return;
        }

        // ✅ ONLY SUCCESS CASE
        setOtpStep("success");
        setOtpError("");
      })
      .catch((err) => {
        // 🔥 HANDLE EMAIL ALREADY USED
        if (err.toLowerCase().includes("email")) {
          setOtpError("This email is already registered.");
        } else if (err.toLowerCase().includes("otp")) {
          setOtpError("Invalid or expired OTP.");
        } else {
          setOtpError(err || "Verification failed");
        }

        setOtp(new Array(OTP_LENGTH).fill(""));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const resetOtpState = () => {
    setOtpStep("idle");
    setOtp(new Array(OTP_LENGTH).fill(""));
    setOtpError("");
    setResendTimer(0);
    clearInterval(timerRef.current);
  };

  const handleSubmit = async () => {
    try {
      if (formData.email !== user.email && otpStep !== "success") {
        toast.error("Please verify OTP before changing email.");
        return;
      }

      await dispatch(updateUser({ data: formData, userId: user.id })).unwrap();
      toast.success("Profile updated!");
      resetOtpState();
      handleClose();
    } catch (err) {
      toast.error(normalizeError(err));
    }
  };

  const handleOtpChange = (e, index) => {
    const val = e.target.value.replace(/\D/, "");
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (val && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleCloseWithReset = () => {
    resetOtpState();
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleCloseWithReset} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Profile Image */}
        <div className="text-center mb-3">
          <div className="position-relative d-inline-block">
            <Image
              src={previewImage || "/profile.png"}
              roundedCircle
              width={100}
              height={100}
              style={{ objectFit: "cover" }}
            />
            <div
              className="position-absolute bottom-0 end-0 p-2 bg-dark rounded-circle"
              onClick={() => fileInputRef.current.click()}
            >
              <Camera className="text-white" size={16} />
            </div>
            <input
              type="file"
              className="d-none"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        </div>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="userName"
              value={formData.userName}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Email + OTP */}
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>

            {otpStep === "idle" && (
              <div className="d-flex gap-2 align-items-center">
                <Form.Control
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="flex-grow-1"
                  style={{ height: "42px", fontSize: "1rem" }}
                />

                <Button
                  variant="success"
                  onClick={handleSendOtp}
                  disabled={loading}
                  style={{
                    height: "42px",
                    padding: "0 16px",
                    fontSize: "1rem",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  Send OTP
                </Button>
              </div>
            )}
            {otpStep === "input" && (
              <div className="p-3 border rounded bg-light">
                <p>Code sent to {maskEmail(formData.email)}</p>

                <div className="d-flex gap-2 mb-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      value={digit}
                      maxLength={1}
                      onChange={(e) => handleOtpChange(e, i)}
                      className="form-control text-center"
                    />
                  ))}
                </div>

                {otpError && (
                  <div className="text-danger small">{otpError}</div>
                )}

                <div className="small">
                  Resend in {resendTimer}s{" "}
                  <button onClick={handleResend} disabled={resendTimer > 0}>
                    Resend
                  </button>
                </div>
              </div>
            )}

            {otpStep === "success" && (
              <div className="d-flex gap-2 align-items-center">
                <Form.Control value={formData.email} disabled />
                <CheckCircle2 color="green" />
                <Button size="sm" onClick={resetOtpState}>
                  Change
                </Button>
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mobile</Form.Label>
            <Form.Control
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>District</Form.Label>
            <Form.Control
              name="district"
              value={formData.district}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Bio</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>

          <Button variant="success" onClick={handleSubmit}>Save Changes</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditProfileModal;
