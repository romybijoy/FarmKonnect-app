import { useState } from "react";

const PostImagesGrid = ({ images = [] }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <>
      {/* GRID */}
      <div
        className="mt-3 grid gap-1"
        style={{
          gridTemplateColumns:
            images.length === 1
              ? "1fr"
              : images.length >= 2
              ? "1fr 1fr"
              : "1fr",
        }}
      >
        {images.slice(0, 3).map((url, idx) => {
          const isThreeAndFirst = images.length === 3 && idx === 0;

          return (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-lg bg-gray-100 ${
                isThreeAndFirst ? "row-span-2" : ""
              }`}
              style={{
                cursor: "pointer",
                minHeight: isThreeAndFirst ? 220 : 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => {
                setLightboxIndex(idx);
                setLightboxOpen(true);
              }}
            >
              <img
                src={url}
                alt={`post-${idx}`}
                className="w-full h-full object-cover"
              />

              {/* +X overlay */}
              {idx === 2 && images.length > 3 && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white text-xl font-semibold">
                  +{images.length - 3}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          {/* Close */}
          <button
            className="absolute top-5 right-5 text-white text-2xl p-2"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
          >
            &times;
          </button>

          {/* Prev */}
          <button
            className="absolute left-4 text-white text-3xl p-2"
            onClick={() =>
              setLightboxIndex(
                (i) => (i - 1 + images.length) % images.length
              )
            }
            aria-label="Previous"
          >
            ‹
          </button>

          {/* Image */}
          <div className="max-w-[90vw] max-h-[90vh]">
            <img
              src={images[lightboxIndex]}
              alt={`lightbox-${lightboxIndex}`}
              className="max-w-full max-h-[80vh] object-contain rounded"
            />
            <div className="text-center text-white mt-2">
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>

          {/* Next */}
          <button
            className="absolute right-4 text-white text-3xl p-2"
            onClick={() =>
              setLightboxIndex((i) => (i + 1) % images.length)
            }
            aria-label="Next"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
};

export default PostImagesGrid;
