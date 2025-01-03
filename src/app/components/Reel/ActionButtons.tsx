import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ShareReel from "./ShareReel";
import io from "socket.io-client";

interface ActionButtonsProps {
  onCommentClick: () => void;
  reelId: string;
  ownerId: string;
  initialLikeStatus: boolean;
  initialLikeCount: number;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCommentClick,
  reelId,
  ownerId,
  initialLikeStatus,
  initialLikeCount,
}) => {
  const [isLiked, setIsLiked] = useState(initialLikeStatus);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
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
      if (update.reelId === reelId) {
        setIsLiked(update.userId === currentUser._id ? update.isLiked : isLiked);
        setLikeCount(update.totalLikes);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [reelId, currentUser._id]);

  useEffect(() => {
    setIsLiked(initialLikeStatus);
    setLikeCount(initialLikeCount);
  }, [initialLikeStatus, initialLikeCount]);

  const handleLikeClick = async () => {
    if (!currentUser._id) {
      alert("Vui lòng đăng nhập để thực hiện chức năng này!");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:4000/reel/like`, {
        reelId: reelId,
        userId: currentUser._id,
      });

      if (response.data) {
        // Socket sẽ tự động cập nhật UI thông qua event listener
        // nên không cần set state ở đây nữa

        // Chỉ gửi notification khi like (không gửi khi unlike)
        if (response.data.isLiked && ownerId !== currentUser._id) {
          const newNotification = {
            owner: currentUser._id,
            idAccount: ownerId,
            idReel: reelId,
            content: "đã yêu thích video của bạn ❤️",
          };

          await axios.post(
            "http://localhost:4000/notification/addPost",
            newNotification
          );
        }
      }
    } catch (error) {
      console.error("Error liking reel:", error);
      alert("Có lỗi xảy ra khi thực hiện thao tác này!");
    }
  };

  const handleReport = async () => {
    if (!currentUser._id) {
      alert("Vui lòng đăng nhập để thực hiện chức năng này!");
      return;
    }

    if (currentUser._id === ownerId) {
      alert("Bạn không thể tự báo cáo reel của mình!");
      return;
    }

    try {
      const newReport = {
        idAccount: currentUser._id,
        idReel: reelId,
        owner: ownerId,
        content: "Xem xét nội dung video có nội dung phản cảm!",
        type: "reel",
        request: "Đang chờ xử lý",
        statusReport: "Chưa xác nhận",
      };

      const res = await fetch("http://localhost:4000/report/reportReel/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReport),
      });

      if (res.ok) {
        alert("Bạn đã báo cáo reel thành công");
        setShowReportModal(false);

        // Gửi thông báo
        const notificationData = {
          owner: currentUser._id,
          idAccount: ownerId,
          idReel: reelId,
          content: "Có người báo cáo video của bạn",
        };

        await fetch("http://localhost:4000/notification/addPost", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(notificationData),
        });
      }
    } catch (error) {
      console.error("Error reporting reel:", error);
      alert("Có lỗi xảy ra khi báo cáo!");
    }
  };

  return (
    <div className="action-buttons">
      <div className="like-container">
        <button
          className={`action-button ${isLiked ? "liked" : ""}`}
          onClick={handleLikeClick}
        >
          <i className={`${isLiked ? "fa-solid" : "fa-regular"} fa-heart`}></i>
        </button>
        {likeCount > 0 && <span className="like-count">{likeCount}</span>}
      </div>
      <button onClick={onCommentClick} className="action-button">
        <i className="fa-regular fa-comment"></i>
      </button>
      <button className="action-button" onClick={() => setShowShareModal(true)}>
        <i className="fa-regular fa-paper-plane"></i>
      </button>
      <div className="more-options">
        <button
          className="action-button"
          onClick={() => setShowReportModal(!showReportModal)}
        >
          <i className="fa-solid fa-ellipsis"></i>
        </button>
        {showReportModal && (
          <div className="report-modal">
            <button onClick={handleReport} className="report-button">
              <i className="fa-solid fa-flag"></i> Báo cáo
            </button>
          </div>
        )}
      </div>
      <ShareReel
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        reelId={reelId}
      />
    </div>
  );
};

export default ActionButtons;
