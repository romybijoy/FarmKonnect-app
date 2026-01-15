import React, { useEffect, useRef, useState } from "react";

function StoryViewer({ user, onClose }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [videoDuration, setVideoDuration] = useState(5);
  const videoRef = useRef(null);
  const story = user.stories[current];

  const handleStart = () => {
    setIsPaused(true);
    if (story.type === "video" && videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleEnd = () => {
    setIsPaused(false);
    if (story.type === "video" && videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleNext = () => {
    if (current < user.stories.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      setCurrent((c) => c - 1);
    }
  };

  useEffect(() => {
    if (story.type === "video" && videoRef.current) {
      const video = videoRef.current;
      const onLoadedMetadata = () => {
        setVideoDuration(video.duration || 5);
      };
      video.addEventListener("loadedmetadata", onLoadedMetadata);
      return () => {
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
      };
    } else {
      setVideoDuration(5);
    }
  }, [current]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      handleNext();
    }, videoDuration * 1000);

    return () => clearTimeout(timer);
  }, [current, isPaused, videoDuration]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Back Button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-50 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full"
      >
        <i className="fa-solid fa-arrow-left"></i>
      </button>
      {/* Left navigation */}
      {current > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full text-white"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
      )}

      <div className="w-full max-w-sm aspect-[9/16] relative overflow-hidden rounded-lg shadow-lg bg-black">
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 px-4 pt-2 bg-black/30 backdrop-blur-sm">
          {user.stories.map((_, index) => (
            <div
              key={index}
              className="h-1.5 flex-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white origin-left"
                style={{
                  transform: `scaleX(${
                    index < current ? 1 : index === current ? 1 : 0
                  })`,
                  ...(index === current
                    ? {
                        animationName: "story-progress",
                        animationDuration: `${videoDuration}s`,
                        animationTimingFunction: "linear",
                        animationFillMode: "forwards",
                        animationPlayState: isPaused ? "paused" : "running",
                      }
                    : { animation: "none" }),
                }}
              ></div>
            </div>
          ))}
        </div>

        {/* Story Media */}
        {story.type === "image" ? (
          <img
            key={story.id}
            src={story.imageUrl}
            className="w-full h-full object-contain transition-all duration-300 ease-in-out"
            alt=""
          />
        ) : (
          <video
            ref={videoRef}
            key={story.id}
            src={story.videoUrl}
            className="w-full h-full object-contain"
            autoPlay
            playsInline
            // muted
            controls={false}
          />
        )}

        {/* Top Bar */}
        <div className="absolute top-4 left-4 z-50 flex items-center space-x-2">
          <div className="relative w-10 h-10">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                strokeWidth="3"
                fill="none"
                className="stroke-gray-500/40"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                strokeWidth="3"
                fill="none"
                strokeDasharray="100"
                strokeDashoffset={`${
                  100 - ((current + 1) / user.stories.length) * 100
                }`}
                className="stroke-pink-500 transition-all duration-500"
              />
            </svg>
            <img
              src={user.profilePic || "/profile.png"}
              alt="profile"
              className="rounded-full w-full h-full object-cover border-2 border-white"
            />
          </div>
          <div className="text-white text-sm">
            <div className="font-semibold">{user.userName}</div>
            <div className="text-xs opacity-70">{story.timestamp}</div>
          </div>
        </div>

        {/* Pause overlay */}
        <div
          className="absolute inset-0 z-40"
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
        ></div>

        {/* Tap navigation */}
        {!isPaused && (
          <div className="absolute inset-0 flex z-20">
            <div
              className="w-1/2"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
            />
            <div
              className="w-1/2"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            />
          </div>
        )}
      </div>

      {/* Right navigation */}
      {current < user.stories.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full text-white"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      )}
    </div>
  );
}

export default StoryViewer;
