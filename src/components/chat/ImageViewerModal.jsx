import { FaTimes } from "react-icons/fa";

export default function ImageViewerModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center bg-white">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-2 right-5 text-xl rounded-full p-2"
      >
        <FaTimes />
      </button>

      {/* Image */}
      <img
        src={imageUrl}
        alt="Full preview"
        className="max-w-[95vw] max-h-[95vh] object-contain"
      />
    </div>
  );
}
