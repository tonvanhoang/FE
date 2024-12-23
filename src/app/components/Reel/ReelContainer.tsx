// ReelContainer.tsx
import React, { useEffect, useState } from "react";
import ReelItem from "./ReelItem";

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

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await fetch(`http://localhost:4000/reel/allReel`);
        if (!response.ok) throw new Error("Failed to fetch reels");
        const data = await response.json();

        // Sắp xếp reels theo thời gian mới nhất
        const sortedReels = Array.isArray(data)
          ? data.sort(
              (a, b) =>
                new Date(b.dateReel).getTime() - new Date(a.dateReel).getTime()
            )
          : [];

        setReels(sortedReels);
      } catch (error) {
        console.error("Error fetching reels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

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
