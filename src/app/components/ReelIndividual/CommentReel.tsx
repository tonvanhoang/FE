import React, { useState, useEffect } from "react";
import axios from 'axios';

interface ReplyComment {
  _id: string;
  idAccount: {
    _id: string;
    firstName: string;
    lastName: string;
  } | string;
  text: string;
  date: string;
  likes: number;
  isLiked: boolean;
}

interface Comment {
  _id: string;
  comment: string;
  dateComment: string;
  likes: number;
  isLiked: boolean;
  idAccount: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
  repComment: ReplyComment[];
}

interface Video {
  _id: string;
  video: string;
  title: string;
  idAccount: {
    _id: string;
    firstName: string;
    lastName: string;
  } | string;
}

interface CommentReelProps {
  onClose: () => void;
  video: Video;
}

const CommentReel: React.FC<CommentReelProps> = ({ onClose, video }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    username: string;
  } | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Lấy thông tin user từ localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const videoOwnerId = typeof video.idAccount === 'object' ? video.idAccount._id : video.idAccount;
  const isOwner = currentUser._id === videoOwnerId;

  useEffect(() => {
    fetchComments();
  }, [video._id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMoreMenu && !(event.target as HTMLElement).closest('.more-options')) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMoreMenu]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:4000/comment/commentByReel/${video._id}`);
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser._id) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (replyingTo) {
        // Xử lý reply comment
        const response = await axios.post(`http://localhost:4000/comment/repPost/${replyingTo.commentId}`, {
          idAccount: currentUser._id,
          text: newComment
        });
        setReplyingTo(null);
      } else {
        // Tạo comment mới
        const response = await axios.post('http://localhost:4000/comment/addpost', {
          comment: newComment,
          idReel: video._id,
          idAccount: currentUser._id
        });
      }

      setNewComment(""); // Clear input
      await fetchComments(); // Refresh comments
    } catch (error) {
      console.error("Error adding comment/reply:", error);
      setError('Failed to add comment/reply');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeComment = async (commentId: string, isReply: boolean = false, parentCommentId?: string) => {
    try {
      if (isReply && parentCommentId) {
        await axios.put(`http://localhost:4000/comment/like-reply/${parentCommentId}/${commentId}`);
      } else {
        await axios.put(`http://localhost:4000/comment/like/${commentId}`);
      }
      fetchComments();
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleDeleteVideo = async () => {
    try {
      // Kiểm tra xem người dùng có phải là chủ sở hữu video không
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (!currentUser._id) {
        setError('Bạn cần đăng nhập để thực hiện chức năng này');
        return;
      }

      // Hiển thị confirm dialog
      if (!window.confirm('Bạn có chắc chắn muốn xóa video này?')) {
        return;
      }

      setIsLoading(true);
      setError(null);

      const response = await axios.delete(`http://localhost:4000/reel/delete/${video._id}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 200) {
        alert('Xóa video thành công!');
        onClose(); // Đóng modal
        window.location.reload(); // Refresh trang để cập nhật danh sách video
      }
    } catch (error: any) {
      console.error("Error deleting video:", error);
      setError(error.response?.data?.message || 'Không thể xóa video. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
      setShowMoreMenu(false);
    }
  };

  return (
    <div className="commentReel">
      <i id="closeCart" onClick={onClose} className="bi bi-x-lg"></i>
      <div className="childcommentReel">
        <div className="detailRight">
          <div className="item">
            <div className="post-images">
              <video controls autoPlay muted>
                <source src={video.video} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
        <div className="detailLeft">
          <div className="comment-header">
            <img src="../img/avata.jpg" alt="" className="avatar" />
            <span className="username">{video.title}</span>
            <div className="more-options">
              <button 
                className="more-btn"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
              >
                <i className="bi bi-three-dots"></i>
              </button>
              {showMoreMenu && isOwner && (
                <div className="more-menu">
                  <button 
                    className="delete-btn"
                    onClick={handleDeleteVideo}
                  >
                    <i className="bi bi-trash"></i>
                    Xóa video
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {isLoading && <div className="loading">Loading...</div>}

          <div className="containerComment">
            {comments.map((comment) => (
              <div key={comment._id} className="commentdetail">
                <div className="avatarUser">
                  <img src={comment.idAccount.avatar || "../img/avata.jpg"} alt="" />
                  <div className="content">
                    <a href="#">{`${comment.idAccount.firstName} ${comment.idAccount.lastName}`}</a>
                    <label>{comment.comment}</label>
                    <div className="timestamp">{comment.dateComment}</div>
                    <div className="comment-actions">
                      <button 
                        className={`action-button ${comment.isLiked ? "liked" : ""}`}
                        onClick={() => handleLikeComment(comment._id)}
                      >
                        {comment.likes} likes
                      </button>
                      <button 
                        className="action-button"
                        onClick={() => setReplyingTo({
                          commentId: comment._id,
                          username: `${comment.idAccount.firstName} ${comment.idAccount.lastName}`
                        })}
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hiển thị replies */}
                {comment.repComment.length > 0 && (
                  <div className="replies-container">
                    {comment.repComment.map((reply) => {
                      const replyUsername = typeof reply.idAccount === 'object' 
                        ? `${reply.idAccount.firstName} ${reply.idAccount.lastName}`
                        : reply.idAccount;

                      return (
                        <div key={reply._id} className="reply">
                          <img src="../img/avata.jpg" alt="" className="avatar" />
                          <div className="content">
                            <a href="#">{replyUsername}</a>
                            <label>{reply.text}</label>
                            <div className="comment-actions">
                              <button 
                                className={`action-button ${reply.isLiked ? "liked" : ""}`}
                                onClick={() => handleLikeComment(reply._id, true, comment._id)}
                              >
                                {reply.likes} likes
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="inPutThemBL">
            {replyingTo && (
              <div className="reply-header">
                <span>Replying to @{replyingTo.username}</span>
                <button onClick={() => setReplyingTo(null)} className="cancel-reply">×</button>
              </div>
            )}
            <div className="d-flex">
              <input
                type="text"
                placeholder={replyingTo ? "Add a reply..." : "Thêm bình luận..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddComment();
                  }
                }}
              />
              <button 
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                Đăng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentReel;