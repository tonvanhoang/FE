// ReelContainer.tsx
import React, { useEffect, useState, useRef } from "react";
import ReelItem from "./ReelItem";
import io from "socket.io-client";

interface Reel {
  _id: string;
  video: string;
  title: string;
  content: string;
  dateReel: string;
  idAccount: { _id: string; firstName: string; lastName: string; avata: string; }
  likes: number;
  likedBy: string[];
  firstName: string;
  lastName: string;
  avata: string;
}

// Đảm bảo kiểu dữ liệu trong ReelItem props cũng khớp
interface ReelItemProps {
  reel: Reel;
}

const ReelContainer: React.FC = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<any>(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    // Kết nối socket
    socketRef.current = io('http://localhost:4000');

    // Lắng nghe sự kiện cập nhật like
    socketRef.current.on('reelLikeUpdate', (update: {
      reelId: string;
      isLiked: boolean;
      totalLikes: number;
      userId: string;
    }) => {
      setReels(prevReels => 
        prevReels.map(reel => 
          reel._id === update.reelId 
            ? {
                ...reel,
                likes: update.totalLikes,
                likedBy: update.isLiked 
                  ? [...(reel.likedBy || []), update.userId]
                  : (reel.likedBy || []).filter(id => id !== update.userId)
              }
            : reel
        )
      );
    });

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const fetchUnviewedReels = async () => {
      try {
        setLoading(true);
        if (!currentUser._id) {
          // Nếu không có user, lấy tất cả reels
          const response = await fetch('http://localhost:4000/reel/all');
          const data = await response.json();
          setReels(data);
        } else {
          // Nếu có user, lấy reels chưa xem
          const response = await fetch(`http://localhost:4000/reel/unviewed/${currentUser._id}`);
          const data = await response.json();
          setReels(data);
        }
      } catch (error) {
        console.error('Error fetching reels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnviewedReels();
  }, [currentUser._id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="containerReels">
      <div className="main-content">
        <div className="video-container">
          {reels.map((reel) => (
            <ReelItem key={reel._id} reel={reel} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReelContainer;
