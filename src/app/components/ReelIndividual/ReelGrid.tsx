import React, { useRef, useEffect } from "react";

interface Video {
  _id: string;
  video: string;
  title: string;
  content?: string;
  dateReel: string;
  idAccount: string;
}

interface ReelGridProps {
  onReelClick: (video: Video) => void;
  videos: Video[];
}

const ReelGrid: React.FC<ReelGridProps> = ({ onReelClick, videos }) => {
  // Tạo ref cho mỗi video để xử lý thumbnail
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});

  useEffect(() => {
    // Xử lý tạo thumbnail cho mỗi video
    videos.forEach((video) => {
      if (videoRefs.current[video._id]) {
        const videoElement = videoRefs.current[video._id];
        // Seek đến giây đầu tiên để lấy thumbnail
        videoElement.currentTime = 0.1;
      }
    });
  }, [videos]);

  return (
    <div id="containerReels" style={{ display: 'block' }}>
      <div className="childReels">
        {videos && videos.length > 0 ? (
          videos.map((video) => (
            <div
              key={video._id}
              className="item"
              onClick={() => onReelClick(video)}
            >
              <video 
                ref={(el) => {
                  if (el) videoRefs.current[video._id] = el;
                }}
                preload="metadata"
                muted
                playsInline
              >
                <source src={video.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="video-overlay">
                <i className="bi bi-play-circle"></i>
              </div>
              <span>
                <i className="bi bi-play-fill"></i>
                {video.content ? `${video.content} N` : "0 N"}
              </span>
            </div>
          ))
        ) : (
          <p>No videos available</p>
        )}
      </div>
    </div>
  );
};

export default ReelGrid;
