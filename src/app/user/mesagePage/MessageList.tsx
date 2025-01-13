import React from 'react';
import ShowAccount from "../componentAccount/image";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  avata: string;
}

interface MessageListProps {
  users: User[];
  onUserSelect: (user: User) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const MessageList = ({ users, onUserSelect, searchTerm, setSearchTerm }: MessageListProps) => (
  <div className="message-list">
    <div className="message-list-header">
      <h5 className="fw-bold mb-0">Messages</h5>
    </div>

    <div className="search-bar">
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

    <ul className="message-list-items">
      {users.map((user) => (
        <li key={user._id} onClick={() => onUserSelect(user)}>
          <ShowAccount params={{ id: user._id }} />
          <div className="message-info">
            <h4>
              {user.firstName} {user.lastName}
            </h4>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default MessageList;
