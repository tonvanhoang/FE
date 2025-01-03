"use client";
import { useEffect, useState, useRef } from "react";
import "../mesagePage/mesage.css";
import Nav from "../navbar/page";
import io from 'socket.io-client';
import ShowAccount from "../componentAccount/image";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faImage, faEllipsisH, faReply, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  avata: string;
}
interface Message {
  _id: string;
  conversationId: string;
  senderId: User;
  content: string;
  createdAt: string;
  isSentByCurrentUser: boolean;
  replyTo?: Message;
}
interface SocketMessage {
  senderId: string;
  receiverId: string;
  content: string;
}
interface SocketMessageData {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  conversationId: string;
  createdAt: string;
}

export default function MessagePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [popupMenu, setPopupMenu] = useState<{
    visible: boolean;
    messageId: string | null;
    position: { x: number; y: number };
  }>({
    visible: false,
    messageId: null,
    position: { x: 0, y: 0 },
  });
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  // Khởi tạo socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Lấy thông tin current user từ localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      console.log("Loaded current user:", user._id);

      // Connect socket với userId
      if (socket) {
        socket.emit("user_connected", user._id);
      }
    }
  }, [socket]);

  // Fetch all users trừ current user
  useEffect(() => {
    const fetchUsers = async () => {
      if (currentUser) {
        try {
          const res = await fetch(
            `http://localhost:4000/account/friendsAccount/${currentUser._id}`
          );
          const data = await res.json();
          setUsers(data);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      }
    };
    fetchUsers();
  }, [currentUser]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Thêm useEffect để scroll xuống khi messages thay đổi
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle click vào user để mở chat
  const handleUserSelect = async (user: User) => {
    setSelectedUser(user);

    if (!currentUser) return;
    try {
      const res = await fetch(
        `http://localhost:4000/message/history/${currentUser._id}/${user._id}`
      );
      const data = await res.json();

      const transformedMessages = data.messages.map((msg: any) => ({
        ...msg,
        isSentByCurrentUser: msg.senderId._id === currentUser._id,
      }));

      setMessages(transformedMessages);
      // Scroll xuống sau khi load tin nhắn
      setTimeout(scrollToBottom, 100); // Thêm một chút delay để đảm bảo messages đã render
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Join conversation room khi chọn user
  useEffect(() => {
    if (socket && selectedUser && currentUser) {
      // Join conversation room
      const conversationId = [currentUser._id, selectedUser._id].sort().join('-');
      socket.emit('join_conversation', conversationId);

      // Listen for new messages
      socket.on('receive_message', async (messageData: SocketMessageData) => {
        console.log('Received message:', messageData);
        if (messageData.senderId !== currentUser._id) {
          setMessages(prev => [...prev, {
            ...messageData,
            senderId: selectedUser!,
            isSentByCurrentUser: false
          } as Message]);
          scrollToBottom();
        }
      });

      return () => {
        socket.off('receive_message');
      };
    }
  }, [socket, selectedUser, currentUser]);

  // Handle gửi tin nhắn
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !selectedUser) return;

    try {
      const conversationId = [currentUser._id, selectedUser._id].sort().join('-');
      
      const res = await fetch("http://localhost:4000/message/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: currentUser._id,
          receiverId: selectedUser._id,
          content: newMessage,
          conversationId: conversationId
        }),
      });

      if (res.ok) {
        const messageData = await res.json();
        const newMsg = {
          ...messageData,
          isSentByCurrentUser: true
        };
        
        // Add message to local state
        setMessages(prev => [...prev, newMsg]);
        
        // Emit message through socket
        socket?.emit('send_message', {
          ...messageData,
          conversationId
        });

        setNewMessage("");
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser || !selectedUser) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('senderId', currentUser._id);
    formData.append('receiverId', selectedUser._id);

    try {
      const res = await fetch('http://localhost:4000/message/send-media', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const messageData = await res.json();
        const newMsg = {
          ...messageData,
          isSentByCurrentUser: true,
        };
        setMessages((prev) => [...prev, newMsg]);
      }
    } catch (error) {
      console.error('Error sending file:', error);
    }
  };

  // Lọc danh sách người dùng theo tên
  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleReply = (message: Message) => {
    setReplyTo(message);
    setPopupMenu({ visible: false, messageId: null, position: { x: 0, y: 0 } });
  };

  const handleSendReply = async () => {
    if (!newMessage.trim() || !currentUser || !selectedUser || !replyTo) return;

    try {
      const res = await fetch("http://localhost:4000/message/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: replyTo.conversationId,
          senderId: currentUser._id,
          content: newMessage,
          replyToId: replyTo._id
        }),
      });

      if (res.ok) {
        const messageData = await res.json();
        setMessages(prev => [...prev, {
          ...messageData,
          isSentByCurrentUser: true
        }]);
        setNewMessage("");
        setReplyTo(null);
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  const handleMoreOptions = (message: Message, event: React.MouseEvent) => {
    event.stopPropagation(); // Ngăn event bubble lên và trigger handleClickOutside
    setPopupMenu({
      visible: true,
      messageId: message._id,
      position: { x: event.clientX, y: event.clientY }
    });
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!currentUser || !selectedUser) return;

    try {
      const response = await fetch(`http://localhost:4000/message/delete/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser._id
        })
      });

      if (response.ok) {
        // Xóa tin nhắn khỏi state local
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg._id !== messageId)
        );

        // Emit socket event
        socket?.emit('delete_message', {
          messageId,
          conversationId: messages.find(m => m._id === messageId)?.conversationId
        });

        // Đóng popup menu
        setPopupMenu(prev => ({ ...prev, visible: false }));
      } else {
        console.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Thêm useEffect để đóng popup khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupMenu.visible) {
        setPopupMenu(prev => ({ ...prev, visible: false }));
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [popupMenu.visible]);

  // Thêm useEffect để lắng nghe sự kiện message_deleted
  useEffect(() => {
    if (socket) {
      socket.on('message_deleted', (data: { messageId: string }) => {
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg._id !== data.messageId)
        );
      });

      return () => {
        socket.off('message_deleted');
      };
    }
  }, [socket]);

  const PopupMenu = () => (
    <div className="popup-menu" style={{
      position: 'fixed',
      left: `${popupMenu.position.x}px`,
      top: `${popupMenu.position.y}px`,
    }} onClick={e => e.stopPropagation()}>
      <button onClick={() => popupMenu.messageId && handleReply(messages.find(m => m._id === popupMenu.messageId)!)}>
        <FontAwesomeIcon icon={faReply} />
        Reply
      </button>
      <button className="delete" onClick={() => popupMenu.messageId && handleDeleteMessage(popupMenu.messageId)}>
        <FontAwesomeIcon icon={faTrash} />
        Delete Message
      </button>
    </div>
  );

  const MessageBubble = ({ message }: { message: Message }) => (
    <div className={`message ${message.isSentByCurrentUser ? "sent" : "received"}`}>
      {message.replyTo && (
        <div className="reply-preview">
          <div className="reply-content">
            <span className="reply-author">
              {message.replyTo.senderId?.firstName || 'Unknown'} {message.replyTo.senderId?.lastName || ''}
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
                ? currentUser!._id 
                : selectedUser!._id 
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
        <div className="message-bubble">
          <p>{message.content}</p>
          <span className="timestamp">
            {new Date(message.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );

  const ReplyPreview = () => (
    replyTo && (
      <div className="reply-preview-container">
        <div className="reply-preview">
          <span>Replying to {replyTo.senderId.firstName} {replyTo.senderId.lastName}</span>
          <p>{replyTo.content}</p>
        </div>
        <button onClick={() => setReplyTo(null)}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    )
  );

  return (
    <>
      <Nav />
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
          {filteredUsers.map((user) => (
            <li key={user._id} onClick={() => handleUserSelect(user)}>
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

      {selectedUser ? (
        <div className="message-container">
          <div className="message-header">
            <Link
              className="text-decoration-none text-black"
              href={`/user/profilePage/${selectedUser._id}`}
            >
              <div className="user-info">
                <ShowAccount params={{ id: selectedUser._id }} />
                <h5>
                  {selectedUser.firstName} {selectedUser.lastName}
                </h5>
              </div>
            </Link>
          </div>

          <div className="message-content">
            {messages.map((message) => (
              <MessageBubble key={message._id} message={message} />
            ))}
            <div ref={messageEndRef} />
          </div>

          <div className="message-input">
            <ReplyPreview />
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === "Enter" && (replyTo ? handleSendReply() : handleSendMessage())}
            />
            
            <input
              type="file"
              ref={fileInputRef}
              className="file-input"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              id="file-input"
            />
            <label htmlFor="file-input" className="file-label">
              <FontAwesomeIcon icon={faImage} />
            </label>

            <button onClick={handleSendMessage}>
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
      ) : (
        <div className="message-container">
          <div className="select-chat">
            <h3>Chọn một người để bắt đầu cuộc trò chuyện</h3>
          </div>
        </div>
      )}

      {/* Thêm popup menu */}
      {popupMenu.visible && (
        <PopupMenu />
      )}
    </>
  );
}
