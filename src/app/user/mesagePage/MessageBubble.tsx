import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReply, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import ShowAccount from "../componentAccount/image";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  avata: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    firstName: string;
    lastName: string;
    avata: string;
  };
  content: string;
  createdAt: string;
  isSentByCurrentUser: boolean;
  replyTo?: {
    _id: string;
    content: string;
    senderId: {
      _id: string;
      firstName: string;
      lastName: string;
      avata: string;
    };
  };
  imageUrl?: string;
  videoUrl?: string;
}

interface MessageBubbleProps {
  message: Message;
  currentUser: User;
  selectedUser: User;
  handleReply: (message: Message) => void;
  handleMoreOptions: (message: Message, event: React.MouseEvent) => void;
}

const MessageBubble = ({ message, currentUser, selectedUser, handleReply, handleMoreOptions }: MessageBubbleProps) => (
  <div className={`message ${message.isSentByCurrentUser ? "sent" : "received"} ${(message.imageUrl || message.videoUrl) ? "has-media" : ""}`}>
    {message.replyTo && (
      <div className="reply-preview">
        <div className="reply-content">
          <span className="reply-author">
            {message.replyTo.senderId?.firstName} {message.replyTo.senderId?.lastName}
          </span>
          <p>{message.replyTo.content}</p>
        </div>
      </div>
    )}
    <div className="message-bubble-wrapper">
      <div className="message-avatar">
        <ShowAccount 
          params={{ 
            id: message.isSentByCurrentUser 
              ? currentUser._id 
              : selectedUser._id 
          }} 
        />
      </div>
      <div className="message-actions">
        <button 
          className="action-button"
          onClick={() => handleReply(message)}
          title="Reply"
        >
          <FontAwesomeIcon icon={faReply} />
        </button>
        <button 
          className="action-button"
          onClick={(e) => handleMoreOptions(message, e)}
          title="More options"
        >
          <FontAwesomeIcon icon={faEllipsisH} />
        </button>
      </div>
      <div className={`message-bubble ${(message.imageUrl || message.videoUrl) ? "has-media" : ""}`}>
        {message.imageUrl && (
          <img 
            src={message.imageUrl} 
            alt="Image message" 
            className="message-image"
          />
        )}
        {message.videoUrl && (
          <video 
            src={message.videoUrl} 
            controls 
            className="message-video"
          />
        )}
        {message.content && <p>{message.content}</p>}
        <span className="timestamp">
          {new Date(message.createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  </div>
);

export default MessageBubble;