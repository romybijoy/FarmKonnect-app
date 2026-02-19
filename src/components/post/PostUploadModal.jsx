// PostUploadModal.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Form,
  Button,
  Row,
  Col,
  Image as RBImage,
  Spinner,
} from "react-bootstrap";
import { FiSend } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Firebase } from "../../firebase/config";
import { createPost, showFeed } from "../../redux/slices/PostSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import ImageCropper from "../../components/ImageUpload/ImageCropper";

/**
 * PostUploadModal
 * - select up to 3 images (multiple)
 * - crop each image one-by-one using ImageCropper (expects a dataURL)
 * - upload cropped images to Firebase and collect urls
 * - create post using createPost({ content, postImages })
 */
export default function PostUploadModal({ isOpen = false, onClose }) {
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]); // [{name, dataUrl}]
  const [currentIndex, setCurrentIndex] = useState(0); // index of file being cropped
  const [imgAfterCrop, setImgAfterCrop] = useState([]); // previews of cropped images
  const [imgUrls, setImgUrls] = useState([]); // uploaded firebase urls
  const [uploading, setUploading] = useState(false);
  const [validated, setValidated] = useState(false);

  const userData = JSON.parse(localStorage.getItem("myInfo") || "{}");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => (isMountedRef.current = false);
  }, []);

  // helper to avoid shadowing global Image constructor
  const createImage = (src) =>
    new Promise((resolve, reject) => {
      try {
        const img = new window.Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
      } catch (err) {
        reject(err);
      }
    });

  const closeModal = () => {
    if (onClose) onClose();
    setText("");
    setSelectedFiles([]);
    setCurrentIndex(0);
    setImgAfterCrop([]);
    setImgUrls([]);
    setValidated(false);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    navigate("/home");
  };

  // handle file selection (multiple)
  const handleOnChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // limit to maximum 3 total images (already uploaded + new ones)
    const available = Math.max(
      0,
      3 - imgUrls.length - selectedFiles.length - imgAfterCrop.length,
    );
    if (available <= 0) {
      toast.warn("You can only upload up to 3 images");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const toTake = files.slice(0, available);
    const readers = toTake.map((file) => {
      return new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res({ name: file.name, dataUrl: r.result });
        r.onerror = rej;
        r.readAsDataURL(file);
      });
    });

    Promise.all(readers)
      .then((results) => {
        setSelectedFiles((prev) => {
          // if no crop currently active, we will start cropping first new file
          const next = [...prev, ...results];
          if (prev.length === 0 && results.length > 0) {
            setCurrentIndex(0);
          }
          return next;
        });
      })
      .catch((err) => {
        console.error("file read error", err);
        toast.error("Failed to read selected files");
      })
      .finally(() => {
        if (inputRef.current) inputRef.current.value = "";
      });
  };

  // Called by ImageCropper when user finishes cropping current image
  // imgCroppedArea expected { x, y, width, height } (pixel values or ratios depending on your cropper)
  const onCropDone = async (imgCroppedArea) => {
    const fileObj = selectedFiles[currentIndex];
    if (!fileObj || !imgCroppedArea) return;
    setUploading(true);

    try {
      // ensure we have a DOM Image at natural size
      const img = await createImage(fileObj.dataUrl);

      // compute pixel crop: if crop values are ratios (0..1), convert to pixels
      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;
      let px = { x: 0, y: 0, width: naturalW, height: naturalH };
      if (imgCroppedArea.width <= 1 && imgCroppedArea.height <= 1) {
        // treat as ratios
        px = {
          x: Math.round(imgCroppedArea.x * naturalW),
          y: Math.round(imgCroppedArea.y * naturalH),
          width: Math.round(imgCroppedArea.width * naturalW),
          height: Math.round(imgCroppedArea.height * naturalH),
        };
      } else {
        // assume pixel values already
        px = {
          x: Math.round(imgCroppedArea.x),
          y: Math.round(imgCroppedArea.y),
          width: Math.round(imgCroppedArea.width),
          height: Math.round(imgCroppedArea.height),
        };
      }

      const canvas = document.createElement("canvas");
      canvas.width = px.width;
      canvas.height = px.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        img,
        px.x,
        px.y,
        px.width,
        px.height,
        0,
        0,
        px.width,
        px.height,
      );
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

      // add preview
      setImgAfterCrop((prev) => {
        const next = [...prev];
        next.push(dataUrl);
        return next;
      });

      // upload to Firebase
      const base64 = dataUrl.split(",")[1];
      const path = `/product/${Date.now()}_${fileObj.name}`;
      const storageRef = Firebase.storage().ref(path);
      const snap = await storageRef.putString(base64, "base64", {
        contentType: "image/jpeg",
      });
      const url = await snap.ref.getDownloadURL();

      setImgUrls((prev) => {
        const next = [...prev, url].slice(0, 3);
        return next;
      });

      // move to next selected file or finish
      const nextIndex = currentIndex + 1;
      if (nextIndex < selectedFiles.length) {
        setCurrentIndex(nextIndex);
      } else {
        // done cropping the queued files
        setSelectedFiles([]);
        setCurrentIndex(0);
      }
      setValidated(true);
    } catch (err) {
      console.error("crop/upload error", err);
      toast.error("Failed to crop/upload image");
    } finally {
      if (isMountedRef.current) setUploading(false);
    }
  };

  const onCropCancel = () => {
    // remove current file from queue and continue with next
    setSelectedFiles((prev) => {
      const next = [...prev];
      next.splice(currentIndex, 1);
      return next;
    });
    // if there are still files, currentIndex stays same (next item moved into this index)
    if (selectedFiles.length <= 1) {
      setCurrentIndex(0);
    }
  };

  const handlePost = async () => {
    if (uploading) {
      toast.info("Please wait for uploads to finish");
      return;
    }
    if (!text.trim() && imgUrls.length === 0) {
      setValidated(true);
      toast.warn("Please add text or image(s) before posting");
      return;
    }

    try {
      const payload = { content: text.trim(), postImages: imgUrls.slice(0, 3) };
      const result = await dispatch(createPost(payload)).unwrap();

      if (result.status === "PENDING") {
        toast.info("Post submitted for AI review");
      } else {
        toast.success("Post Created Successfully");
      }

      closeModal();

      // Refresh feed after AI likely finished
      setTimeout(() => {
        dispatch(showFeed(userId));
      }, 3000);
    } catch (err) {
      console.error("createPost error", err);
      toast.error("Failed to create post");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handlePost();
  };

  // current dataUrl being cropped, derived from selectedFiles[currentIndex]
  const currentCropImage = selectedFiles[currentIndex]?.dataUrl ?? null;

  return (
    <Modal
      show={isOpen}
      onHide={closeModal}
      centered
      size="xl"
      dialogClassName="rounded-3"
      backdrop="static"
      keyboard
    >
      <Modal.Header closeButton>
        <Modal.Title>Create a Post</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group controlId="postTextarea" className="mb-3">
            <Row className="g-2 align-items-start">
              <Col xs="auto" className="pe-0">
                {/* using native img for avatar */}
                <img
                  src={userData.image || "/profile.png"}
                  alt="Avatar"
                  width={56}
                  height={56}
                  style={{ objectFit: "cover", borderRadius: "50%" }}
                />
              </Col>
              <Col>
                <Form.Control
                  as="textarea"
                  placeholder="What's on your mind?"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <Form.Control.Feedback type="invalid">
                  Please write something or attach an image.
                </Form.Control.Feedback>
              </Col>
            </Row>
          </Form.Group>

          {/* previews */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 8,
            }}
          >
            {imgUrls.map((u, i) => (
              <img
                key={i}
                src={u}
                alt={`uploaded-${i}`}
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "cover",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              />
            ))}
            {/* {imgAfterCrop.map((d, i) => d && <img key={"crop-" + i} src={d} alt={`cropped-${i}`} style={{ width: 100, height: 100, objectFit: "cover", border: "1px dashed #bbb", borderRadius: 4 }} />)} */}
          </div>

          <div className="d-flex justify-content-between align-items-center mt-2">
            <Form.Group className="my-2 mb-0" controlId="image">
              <Form.Label style={{ display: "block" }}>
                Images (max 3)
              </Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                multiple
                ref={inputRef}
                onChange={handleOnChange}
                disabled={uploading || imgUrls.length >= 3}
              />
              {currentCropImage && (
                <div className="mt-3">
                  <ImageCropper
                    image={currentCropImage}
                    visible={true}
                    onCropDone={onCropDone}
                    onCropCancel={onCropCancel}
                  />
                  <div className="mt-2">
                    Cropping {currentIndex + 1} of {selectedFiles.length}
                  </div>
                </div>
              )}
              <Form.Control.Feedback type="invalid">
                Please choose an image
              </Form.Control.Feedback>
            </Form.Group>

            <div>
              <Button
                type="submit"
                disabled={uploading || (!text.trim() && imgUrls.length === 0)}
                style={{ backgroundColor: "#689F38", borderColor: "#689F38" }}
                className="d-inline-flex align-items-center"
              >
                {uploading ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <FiSend className="me-2" />
                )}
                Post
              </Button>
            </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
