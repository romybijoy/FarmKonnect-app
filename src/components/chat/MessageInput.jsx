import React, { useState, useRef, useEffect } from "react";
import {
  FaSmile,
  FaPaperclip,
  FaMicrophone,
  FaPaperPlane,
  FaTimes,
} from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Firebase } from "../../firebase/config";

export default function MessageInput({
  onSend,
  disabled,
  chatType,
  selectedChat,
}) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const fileInputRef = useRef(null);
  const emojiRef = useRef(null);
  const userData = JSON.parse(localStorage.getItem("myInfo"));

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const maxSizeMB = 10;
    const allowedTypes = ["image/", "video/"];

    if (!allowedTypes.some((type) => file.type.startsWith(type))) {
      alert("Only image and video files are allowed.");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size should be less than ${maxSizeMB}MB.`);
      return;
    }

    setSelectedFile(file);
  };

  const handleSend = async () => {
    if (!text.trim() && !selectedFile && !audioBlob) return;

    // Handle voice message
    if (audioBlob) {
      setUploading(true);

      const audioRef = ref(
        Firebase.storage(),
        `voice_notes/${Date.now()}.webm`
      );
      const uploadTask = uploadBytesResumable(audioRef, audioBlob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress.toFixed(0));
        },
        (error) => {
          console.error("Audio upload error:", error);
          setUploading(false);
        },
        async () => {
          const audioDownloadUrl = await getDownloadURL(
            uploadTask.snapshot.ref
          );
          sendFinalMessage(audioDownloadUrl, "audio");
          setAudioBlob(null);
          setAudioUrl(null); // if using preview
          setUploading(false);
        }
      );

      return;
    }

    // Handle image/video file
    if (selectedFile) {
      setUploading(true);

      const fileRef = ref(
        Firebase.storage(),
        `chat_uploads/${Date.now()}_${selectedFile.name}`
      );
      const uploadTask = uploadBytesResumable(fileRef, selectedFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress.toFixed(0));
        },
        (error) => {
          console.error("Upload error:", error);
          setUploading(false);
        },
        async () => {
          const fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const fileType = selectedFile.type.startsWith("video")
            ? "video"
            : "image";

          sendFinalMessage(fileUrl, fileType);
          setSelectedFile(null);
          fileInputRef.current.value = "";
          setUploading(false);
        }
      );

      return;
    }

    // Text-only message
    sendFinalMessage(null, "text");
  };

  const sendFinalMessage = (fileUrl, type) => {
    const message = {
      content: text,
      receiverId: chatType === "private" ? selectedChat : null,
      senderId: userData.id,
      groupId: chatType === "group" ? selectedChat : null,
      fileUrl: fileUrl,
      type: type,
    };

    onSend(message);
    setText("");
    setSelectedFile(null);
    setUploadProgress(0);
    setUploading(false);
    setAudioBlob(null);
    setAudioUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      let chunks = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  return (
    <div className="relative border-t px-4 py-2 bg-white">
      {/* File Preview */}
      {selectedFile && (
        <div className="p-2">
          <div className="relative w-32 h-32">
            {selectedFile.type.startsWith("video") ? (
              <video
                src={URL.createObjectURL(selectedFile)}
                controls
                className="rounded-lg w-full h-full"
              />
            ) : (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="rounded-lg w-full h-full object-cover"
              />
            )}
            <button
              className="absolute top-1 right-1 text-white bg-black bg-opacity-50 rounded-full p-1"
              onClick={() => setSelectedFile(null)}
              disabled={uploading}
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress Bar */}
      {uploading && (
        <div className="w-full px-2 pb-2">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">{uploadProgress}%</p>
        </div>
      )}

      {audioUrl && (
        <div className="flex items-center gap-2 p-2">
          <audio controls src={audioUrl} className="w-full max-w-xs" />
          <button
            className="bg-red-500 text-white px-2 py-1 rounded"
            onClick={() => {
              setAudioUrl(null);
              setAudioBlob(null);
            }}
          >
            ❌
          </button>
        </div>
      )}

      {/* Message Controls */}
      <div className="flex items-center">
        <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="text-gray-600 hover:text-gray-800 mr-2"
        >
          <FaSmile size={20} />
        </button>

        <input
          type="text"
          value={text}
          disabled={disabled || uploading}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message"
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none"
        />

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current.click()}
          className="text-gray-600 hover:text-gray-800 mx-2"
          disabled={uploading}
        >
          <FaPaperclip size={18} />
        </button>

        <button
          className="text-gray-600 hover:text-gray-800 mr-2"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={uploading}
        >
          {isRecording ? "⏹️" : <FaMicrophone size={18} />}
        </button>

        <button
          onClick={handleSend}
          disabled={disabled || uploading}
          className="bg-blue-500 text-white rounded-full p-2"
        >
          <FaPaperPlane size={16} />
        </button>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div
          ref={emojiRef}
          className="absolute bottom-16 left-4 z-50 shadow-lg"
        >
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  );
}
