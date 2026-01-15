import React, { useState, useRef, useEffect } from "react";
import {
  FaSmile,
  FaPaperclip,
  FaMicrophone,
  FaPaperPlane,
} from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { useWebSocket } from "../../context/WebSocketContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Firebase } from "../../firebase/config";

export default function MessageInput({
  onSend,
  disabled,
  chatType,
  selectedChat,
  onFileSelect, // 📎 lifted to ChatWindow
}) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // 🎤 Audio states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const recordingTimerRef = useRef(null);

  const fileInputRef = useRef(null);
  const emojiRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const userData = JSON.parse(localStorage.getItem("myInfo"));
  const { sendTypingStatus } = useWebSocket();

  // ---------------- Emoji ----------------
  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  // ---------------- File select ----------------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "image/",
      "video/",
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.some((type) => file.type.startsWith(type))) {
      alert("Unsupported file type");
      return;
    }

    onFileSelect(file);
    fileInputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      setAudioBlob(null);
      setAudioPreviewUrl(null);
      setRecordingTime(0);
      clearInterval(recordingTimerRef.current);
    };
  }, []);

  // ---------------- Firebase upload helper ----------------
  const uploadToFirebase = async (path, file) => {
    const storageRef = ref(Firebase.storage(), path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  // ---------------- Text send ----------------
  const handleSendText = () => {
    if (!text.trim()) return;

    onSend({
      content: text,
      type: "text",
    });

    setText("");
  };

  // ---------------- Audio recording ----------------
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioPreviewUrl(URL.createObjectURL(blob)); // 🔥 preview
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error("Mic error", err);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorder) return;

    mediaRecorder.stop();
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
  };

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(
      sec % 60
    ).padStart(2, "0")}`;

  // ---------------- Send audio ----------------
  const sendAudio = () => {
    if (!audioBlob) return;

    onSend({
      type: "audio",
      audioBlob,
    });

    setAudioBlob(null);
    setAudioPreviewUrl(null);
    setRecordingTime(0);
  };

  // ---------------- Typing indicator ----------------
  const handleTyping = (value) => {
    setText(value);

    const payload =
      chatType === "group"
        ? { email: userData.email, isTyping: true, groupId: selectedChat }
        : { email: userData.email, isTyping: true, receiverId: selectedChat };

    sendTypingStatus(payload);

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus({ ...payload, isTyping: false });
    }, 1500);
  };

  // ---------------- Close emoji picker ----------------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  // ---------------- UI ----------------
  return (
    <div className="relative bg-white px-4 py-2 border-t">
      {showEmojiPicker && (
        <div
          ref={emojiRef}
          className="absolute bottom-16 left-4 z-50 shadow-lg"
        >
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowEmojiPicker((p) => !p)}
          className="text-gray-600"
        >
          <FaSmile size={20} />
        </button>

        {/* 🎤 Recording UI */}
        {isRecording && (
          <div className="flex items-center gap-3 flex-1">
            <span className="text-red-500 animate-pulse">🎤</span>
            <span className="text-sm text-gray-700">
              Recording... {formatTime(recordingTime)}
            </span>
            <button onClick={stopRecording} className="ml-auto text-red-500">
              ⏹
            </button>
          </div>
        )}

        {/* ▶ Audio Preview UI */}
        {audioPreviewUrl && !isRecording && (
          <div className="flex items-center gap-3 flex-1">
            <audio controls src={audioPreviewUrl} className="h-8" />
            <button
              onClick={() => {
                setAudioBlob(null);
                setAudioPreviewUrl(null);
              }}
              className="text-gray-500"
            >
              ❌
            </button>
          </div>
        )}

        {/* ✍ Normal Text Input */}
        {!isRecording && !audioPreviewUrl && (
          <input
            type="text"
            value={text}
            disabled={disabled}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendText()}
            placeholder="Type a message"
            className="flex-1 border rounded-full px-4 py-2"
          />
        )}

        {/* File */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,video/*,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current.click()}
          className="text-gray-600"
        >
          <FaPaperclip size={18} />
        </button>

        {/* Audio */}
        {!isRecording && !audioPreviewUrl && (
          <button onClick={startRecording} className="text-gray-600">
            <FaMicrophone size={18} />
          </button>
        )}

        {/* Send */}
        <button
          onClick={() => {
            if (audioBlob) sendAudio();
            else handleSendText();
          }}
          className="bg-[#689F38] text-white rounded-full p-2"
        >
          <FaPaperPlane size={16} />
        </button>
      </div>
    </div>
  );
}
