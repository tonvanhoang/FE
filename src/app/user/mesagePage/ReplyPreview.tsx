import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Message } from './MessageBubble';

interface ReplyPreviewProps {
  replyTo: Message | null;
  clearReply: () => void;
}

const ReplyPreview = ({ replyTo, clearReply }: ReplyPreviewProps) => (
  replyTo ? (
    <div className="reply-preview-container">
      <div className="reply-preview">
        <span>Replying to {replyTo.senderId.firstName} {replyTo.senderId.lastName}</span>
        <p>{replyTo.content}</p>
      </div>
      <button onClick={clearReply}>
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  ) : null
);

export default ReplyPreview;