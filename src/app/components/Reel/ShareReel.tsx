import React, { useState } from "react";
import "./ShareReel.css";

interface ShareReelProps {
  isOpen: boolean;
  onClose: () => void;
  reelId: string;
}

const ShareReel: React.FC<ShareReelProps> = ({ isOpen, onClose, reelId }) => {
  if (!isOpen) return null;

  const copyToClipboard = () => {
    const textToCopy = `http://localhost:3000/user/detailReel/${reelId}`;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        alert("Đã sao chép vào clipboard!");
      })
      .catch((err) => {
        console.error("Không thể sao chép: ", err);
      });
  };

  return (
    <div className="linkPost">
      <div className="d-flex align-self-center">
        <p className="m-0">http://localhost:3000/user/detailReel/{reelId}</p>
        <button className="btnCopy" onClick={copyToClipboard}>
          Copy
        </button>
      </div>
      <div
        className=""
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        <button className="btnClose" onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
};

export default ShareReel;
