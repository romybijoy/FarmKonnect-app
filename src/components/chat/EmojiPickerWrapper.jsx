import React, { useRef, useEffect, useState } from "react";
import Picker from "emoji-picker-react";

export default function EmojiPickerWrapper({
  buttonRef,
  onEmojiSelect,
  onClose,
  isSentByMe
}) {
  const pickerRef = useRef(null);
  const [pickerPosition, setPickerPosition] = useState("top"); // 'top' or 'bottom'

  // Decide position based on button position
  useEffect(() => {
    if (buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      setPickerPosition(rect.bottom > windowHeight / 2 ? "top" : "bottom");
    }
  }, [buttonRef]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
    
  }, [buttonRef, onClose]);

  return (
    <div
      ref={pickerRef}
      className={`absolute z-10 scale-90 ${
        pickerPosition === "top" ? "bottom-[100%] mb-1" : "top-[100%] mt-1"
      }  ${isSentByMe ? "right-0" : "left-0"}` }
    >
      <Picker
        onEmojiClick={(emojiData) => {
          onEmojiSelect(emojiData.emoji);
          onClose();
        }}
        width={300}
        height={400}
        style={{
          margin: 0, // remove default spacing
          padding: 0, // remove padding
          boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
        }}
      />
    </div>
  );
}
