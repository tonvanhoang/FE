import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReply, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Message } from './MessageBubble';

interface PopupMenuProps {
  position: { x: number; y: number };
  messageId: string | null;
  handleReply: (message: Message) => void;
  handleDeleteMessage: (messageId: string) => void;
  messages: Message[];
}

const PopupMenu = ({ position, messageId, handleReply, handleDeleteMessage, messages }: PopupMenuProps) => {
  const message = messages.find(m => m._id === messageId);

  return (
    <div className="popup-menu" style={{
      position: 'fixed',
      left: `${position.x}px`,
      top: `${position.y}px`,
    }} onClick={e => e.stopPropagation()}>
      <button onClick={() => message && handleReply(message)}>
        <FontAwesomeIcon icon={faReply} />
        Reply
      </button>
      <button className="delete" onClick={() => messageId && handleDeleteMessage(messageId)}>
        <FontAwesomeIcon icon={faTrash} />
        Delete Message
      </button>
    </div>
  );
};

export default PopupMenu;
