"use client";
import React, { useState, useEffect } from "react";
import ReelGrid from "../../components/ReelIndividual/ReelGrid";
import CommentReel from "../../components/ReelIndividual/CommentReel";
// import "./reel.css";
import "./reel1.css";
import axios from "axios";

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
        // Lấy reels theo idAccount từ params.id
        const response = await axios.get(`http://localhost:4000/reel/reelsByAccount/${params.id}`);
        setVideos(response.data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, [params.id]);

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
