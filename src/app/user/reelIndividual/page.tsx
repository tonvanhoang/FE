"use client";
import React, { useState, useEffect } from "react";
import ReelGrid from "../../components/ReelIndividual/ReelGrid";
import CommentReel from "../../components/ReelIndividual/CommentReel";
// import "./reel.css";
import "./reel1.css";

interface Video {
  _id: string; // Unique identifier for the video
  video: string; // Video URL
  title: string; // Title of the reel
  content?: string; // Optional content
  dateReel: string; // Date of the reel
  idAccount: string; // Account ID
}

export default function ReelIndividual({ params }: { params: { id: string } }) {
  const [showCommentReel, setShowCommentReel] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // Fetch videos của user có ID từ params thay vì từ localStorage
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/reel/reelsByAccount/${params.id}`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideos();
  }, [params.id]); // Dependency là params.id

  const handleReelClick = (video: Video) => {
    setSelectedVideo(video);
    setShowCommentReel(true);
  };

  const handleCloseCommentReel = () => {
    setShowCommentReel(false);
    setSelectedVideo(null);
  };

  return (
    <>
      <ReelGrid videos={videos} onReelClick={handleReelClick} />{" "}
      {/* Pass videos to ReelGrid */}
      {showCommentReel && selectedVideo && (
        <CommentReel 
          onClose={handleCloseCommentReel}
          video={selectedVideo}
        />
      )}
    </>
  );
}
