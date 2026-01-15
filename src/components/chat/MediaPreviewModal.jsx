import { FaTimes, FaPaperPlane, FaSmile } from "react-icons/fa";

export default function MediaPreviewModal({
  file,
  caption,
  setCaption,
  onClose,
  onSend,
}) {
  const isImage = file.type.startsWith("image");
  console.log(file.type)
  const isVideo = file.type.startsWith("video");
  const isPdf = file.type === "application/pdf";
  const isExcel =
    file.type.includes("excel") || file.type.includes("spreadsheet");

    console.log("first")
  return (
    <div className="absolute inset-0 z-50 bg-[#F0F2F5] flex flex-col">

      {/* Top bar */}
      <div className="h-14 bg-white border-b flex items-center px-4">
        <button onClick={onClose} className="text-xl text-gray-600">
          <FaTimes />
        </button>

        <p className="ml-4 text-sm font-medium truncate">
          {file.name}
        </p>
      </div>

      {/* Preview area */}
      <div className="flex-1 flex items-center justify-center bg-[#ECE5DD] overflow-hidden">
        {isImage && (
          <div className="flex-1 bg-[#ECE5DD] flex items-center justify-center overflow-auto">
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            className="max-w-[90vw] max-h-[calc(100vh-160px)] object-contain"
          />
          </div>
        )}

        {isVideo && (
           <div className="max-h-[75vh] max-w-[90%] flex items-center justify-center">
          <video
            src={URL.createObjectURL(file)}
            controls
            className="w-auto h-auto max-w-full max-h-full object-contain"
          />
          </div>
        )}

        {(isPdf || isExcel) && (
          <div className="bg-white rounded-lg shadow p-10 flex flex-col items-center">
            <div className="text-6xl mb-4">
              {isPdf ? "📄" : "📊"}
            </div>
            <p className="text-gray-500 text-sm">No preview available</p>
            <p className="text-xs text-gray-400 mt-1">
              {(file.size / 1024).toFixed(0)} KB ·{" "}
              {isPdf ? "PDF" : "EXCEL"}
            </p>
          </div>
        )}
      </div>

      {/* Bottom composer */}
      <div className="bg-white p-4 flex items-center gap-3 border-t">
        <FaSmile className="text-gray-500 text-xl" />

        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption"
          className="flex-1 border rounded-full px-4 py-2 outline-none"
        />

        <button
          onClick={onSend}
          className="bg-[#25D366] text-white rounded-full p-3"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}
