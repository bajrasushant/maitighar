import React from "react";

function MediaRenderer({ mediaPath }) {
  const appUrl = "http://localhost:3003";
  const isVideo = /\.(mp4|mkv|avi)$/.test(mediaPath);
  const videoTypes = {
    mp4: "video/mp4",
    mkv: "video/x-matroska",
    avi: "video/x-msvideo",
  };

  if (isVideo) {
    const extension = mediaPath.split(".").pop();
    return (
      <video
        controls
        className="max-w-full mb-2.5 h-120"
        style={{
          maxWidth: "100%",
          // height: "720px",
        }}
      >
        <source
          src={`${appUrl}/${mediaPath}`}
          type={videoTypes[extension]}
        />
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <img
      src={`${appUrl}/${mediaPath}`}
      alt="Issue media"
      className="max-w-auto mb-2.5 h-120"
      style={{
        maxWidth: "100%",
        // height: "240px",
        objectFit: "cover",
      }}
    />
  );
}

export default MediaRenderer;
