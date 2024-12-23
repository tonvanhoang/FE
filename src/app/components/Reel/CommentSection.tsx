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

interface CommentSectionProps {
  isVisible: boolean;
  onClose: () => void;
  reelId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  isVisible,
  onClose,
  reelId
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    username: string;
    ownerId: string;
  } | null>(null);

  // Lấy thông tin user từ localStorage (giả sử đã lưu sau khi đăng nhập)
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    console.log('ReelId:', reelId);
    if (isVisible && reelId) {
      fetchComments();
    }
  }, [isVisible, reelId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching comments for reelId:', reelId);
      const response = await axios.get(`http://localhost:4000/comment/commentByReel/${reelId}`);
      console.log('API Response:', response.data);
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e: React.KeyboardEvent | React.MouseEvent) => {
    if (
      'key' in e && e.key !== 'Enter' || 
      !newComment.trim() || 
      !currentUser._id || 
      !reelId
    ) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Get reel information
      const reelResponse = await axios.get(`http://localhost:4000/reel/reelById/${reelId}`);
      const reelData = reelResponse.data;
      
      // If replying to a comment
      if (replyingTo) {
        const response = await axios.post(`http://localhost:4000/comment/repPost/${replyingTo.commentId}`, {
          idAccount: currentUser._id,
          text: newComment
        });
        
        console.log('Add reply response:', response.data);
        setReplyingTo(null);
        
        // Add notification for reply if the comment owner is different from current user
        if (replyingTo.ownerId !== currentUser._id) {
          const newNotification = {
            owner: currentUser._id,
            idAccount: replyingTo.ownerId,
            idReel: reelId,
            content: "đã trả lời bình luận của bạn"
          };
          
          await axios.post('http://localhost:4000/notification/addPost', newNotification);
        }
      } else {
        // If creating new comment
        const response = await axios.post('http://localhost:4000/comment/addpost', {
          comment: newComment,
          idReel: reelId,
          idAccount: currentUser._id
        });
        
        console.log('Add comment response:', response.data);
        
        // Add notification for comment if the reel owner is different from current user
        if (reelData.idAccount._id !== currentUser._id) {
          const newNotification = {
            owner: currentUser._id,
            idAccount: reelData.idAccount._id,
            idReel: reelId,
            content: "đã bình luận về video của bạn"
          };
          
          await axios.post('http://localhost:4000/notification/addPost', newNotification);
        }
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
      fetchComments(); // Refresh comments to get updated likes
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="comment-section active">
      {error && <div className="error-message">{error}</div>}
      {isLoading && <div className="loading">Loading...</div>}
      
      {/* {console.log('Current comments:', comments)} */}
      <div className="title">
        <h5>Bình luận ({comments.length})</h5>
        <button onClick={onClose} className="close-btn">&times;</button>
      </div>

      <div className="commentChild">
        {comments.map((comment) => (
          <div key={comment._id} className="comment-thread">
            <div className="comment-main">
              <img
                src={comment.idAccount.avatar || "../img/avata.jpg"}
                alt="avatar"
                className="comment-avatar"
              />
              <div className="comment-content">
                <span className="comment-username">
                  {`${comment.idAccount.firstName} ${comment.idAccount.lastName}`}
                </span>
                <p className="comment-text">{comment.comment}</p>
                <div className="comment-actions">
                  <button
                    className={`like-btn ${comment.isLiked ? "liked" : ""}`}
                    onClick={() => handleLikeComment(comment._id)}
                  >
                    {comment.isLiked ? "Liked" : "Like"}
                  </button>
                  <button
                    className="reply-btn"
                    onClick={() => setReplyingTo({
                      commentId: comment._id,
                      username: `${comment.idAccount.firstName} ${comment.idAccount.lastName}`,
                      ownerId: comment.idAccount._id
                    })}
                  >
                    Reply
                  </button>
                  <span className="likes">{comment.likes} likes</span>
                </div>
              </div>
            </div>

            {comment.repComment.length > 0 && (
              <div className="replies-container">
                {comment.repComment.map((reply) => {
                  // Kiểm tra nếu reply.idAccount là object
                  const replyUsername = typeof reply.idAccount === 'object' 
                    ? `${reply.idAccount.firstName} ${reply.idAccount.lastName}`
                    : reply.idAccount;

                  return (
                    <div key={reply._id} className="reply">
                      <img
                        src="../img/avata.jpg"
                        alt="avatar"
                        className="comment-avatar"
                      />
                      <div className="comment-content">
                        <span className="comment-username">{replyUsername}</span>
                        <p className="comment-text">{reply.text}</p>
                        <div className="comment-actions">
                          <button
                            className={`like-btn ${reply.isLiked ? "liked" : ""}`}
                            onClick={() => handleLikeComment(reply._id, true, comment._id)}
                          >
                            {reply.isLiked ? "Liked" : "Like"}
                          </button>
                          <span className="likes">{reply.likes} likes</span>
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

      <div className="add-comment">
        {replyingTo && (
          <div className="reply-header">
            <span>Replying to @{replyingTo.username}</span>
            <button onClick={() => setReplyingTo(null)} className="cancel-reply">
              ×
            </button>
          </div>
        )}
        <div className="comment-input-wrapper">
          <input
            type="text"
            placeholder={replyingTo ? "Add a reply..." : "Add a comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleAddComment}
          />
          <button
            onClick={handleAddComment}
            className={newComment.trim() ? "active" : ""}
          >
            Đăng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
