function ExistingImagesGrid({ images, onRemove }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap mb-3">
      {images.map((img, index) => (
        <div key={index} className="relative">
          <img
            src={img}
            alt="existing"
            className="w-24 h-24 object-cover rounded"
          />

          <button
            type="button"
            className="absolute -top-1 -right-1 bg-black bg-opacity-70 text-white rounded-full w-6 h-6"
            onClick={() => onRemove(index)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default ExistingImagesGrid;