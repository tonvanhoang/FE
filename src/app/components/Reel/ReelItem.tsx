import React, { useEffect, useState, useRef } from "react";
import ActionButtons from "./ActionButtons";
import CommentSection from "./CommentSection";

interface Reel {
  _id: string;
  video: string;
  title: string;
  content: string;
  dateReel: string;
  likes: number;
  likedBy: string[];
  idAccount: {
    _id: string;
    firstName: string;
    lastName: string;
    avata: string;
  };
  firstName: string;
  lastName: string;
  avata: string;
}

interface ReelItemProps {
  reel: Reel;
}

const ReelItem: React.FC<ReelItemProps> = ({ reel }) => {
  const [showComment, setShowComment] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.7,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          videoRef.current?.play();
        } else {
          videoRef.current?.pause();
        }
      });
    }, options);

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const toggleComment = () => {
    setShowComment((prev) => !prev);
  };

  const handleFollowClick = () => {
    if (!currentUser._id) {
      alert("Vui lòng đăng nhập để thực hiện chức năng này!");
      return;
    }
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="video-item" ref={containerRef}>
      <div className="video-content">
        <div className="video-wrapper">
          <video ref={videoRef} src={reel.video} controls loop autoPlay muted />
          <div className="video-info">
            <div className="user-info">
              <div className="user-profile">
                <img
                  src={`/img/${reel.idAccount?.avata}` || "../img/avata2.jpg"}
                  alt="avatar"
                  className="poster-avatar"
                />
                <div className="username">
                  {reel.firstName} {reel.lastName}
                </div>
                <button
                  className={`follow-button ${isFollowing ? "following" : ""}`}
                  onClick={handleFollowClick}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            </div>
            <div className="caption">{reel.content}</div>
          </div>
        </div>
        <ActionButtons
          onCommentClick={toggleComment}
          reelId={reel._id}
          ownerId={reel.idAccount?._id}
          initialLikeStatus={reel.likedBy?.includes(currentUser._id)}
          initialLikeCount={reel.likes}
/>
      </div>
      <CommentSection
        isVisible={showComment}
        onClose={toggleComment}
        reelId={reel._id}
      />
    </div>
  );
};

export default ReelItem;