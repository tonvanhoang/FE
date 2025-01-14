"use client";
import { useEffect, useState, useRef } from "react";
import "../mesagePage/message.css";
import Nav from "../navbar/page";
import { useSocket } from '@/hooks/useSocket';
import ShowAccount from "../componentAccount/image";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faImage, faEllipsisH, faReply, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import MessageBubble from './MessageBubble';
import { Message } from './MessageBubble';
import ReplyPreview from './ReplyPreview';
import PopupMenu from './PopupMenu';
import MessageList from './MessageList';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  avata: string;
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

const NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dqso33xek";
const NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="message_load_preset_0123";

export default function MessagePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const socket = useSocket();
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
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    preview: string;
    type: 'image' | 'video';
  } | null>(null);

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

  // Xử lý socket connection và messages
  useEffect(() => {
    if (socket && selectedUser && currentUser) {
      const conversationId = [currentUser._id, selectedUser._id].sort().join('-');
      
      // Emit user connected event
      socket.emit('user_connected', currentUser._id);
      
      // Join conversation room
      socket.emit('join_conversation', conversationId);
      
      // Listen for new messages
      const handleNewMessage = (message: any) => {
        console.log('Received new message:', message);
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      };

      socket.on('new_message', handleNewMessage);

      // Cleanup
      return () => {
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [socket, selectedUser, currentUser]);

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
          conversationId
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      const messageData = await res.json();
      
      // Add message to local state with isSentByCurrentUser flag
      const newMsg = {
        ...messageData,
        isSentByCurrentUser: true
      };
      
      setMessages(prev => [...prev, newMsg]);
      
      // Emit message through socket
      console.log('Emitting message:', newMsg);
      socket?.emit('send_message', newMsg);

      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser || !selectedUser) return;

    // Tạo preview URL
    const previewUrl = URL.createObjectURL(file);
    
    // Xác định loại file
    const fileType = file.type.startsWith('image/') ? 'image' : 'video';
    
    // Lưu thông tin file và preview vào state
    setSelectedFile({
      file,
      preview: previewUrl,
      type: fileType
    });
  };

  // Thêm hàm xử lý gửi media message
  const handleSendMediaMessage = async () => {
    if (!selectedFile || !currentUser || !selectedUser) return;

    try {
      // Upload to Cloudinary first
      const formData = new FormData();
      formData.append('file', selectedFile.file);
      formData.append('upload_preset', NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'messages'); // Thêm folder để tổ chức file

      console.log('Uploading to Cloudinary...');
      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!cloudinaryRes.ok) {
        const errorData = await cloudinaryRes.json();
        throw new Error(`Cloudinary upload failed: ${errorData.message}`);
      }

      const cloudinaryData = await cloudinaryRes.json();
      console.log('Cloudinary upload successful:', cloudinaryData);

      // Create message data
      const conversationId = [currentUser._id, selectedUser._id].sort().join('-');
      const messageData = {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        conversationId,
        [selectedFile.type === 'image' ? 'imageUrl' : 'videoUrl']: cloudinaryData.secure_url
      };

      console.log('Sending message to server:', messageData);
      const res = await fetch('http://localhost:4000/message/sendMediaMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      const newMsg = await res.json();
      console.log('Message sent successfully:', newMsg);

      // Update UI
      setMessages(prev => [...prev, {
        ...newMsg,
        isSentByCurrentUser: true
      }]);
      
      // Emit socket event
      socket?.emit('send_message', {
        ...newMsg,
        isSentByCurrentUser: false
      });

      // Clear preview
      clearFilePreview();
    } catch (error) {
      console.error('Error sending media:', error);
      alert('Failed to send media message: ' + (error as Error).message);
    }
  };

  // Thêm hàm để clear preview
  const clearFilePreview = () => {
    if (selectedFile) {
      URL.revokeObjectURL(selectedFile.preview);
      setSelectedFile(null);
    }
  };

  // Lọc danh sách người dùng theo tên
  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleReply = (message: Message) => {
    console.log("Setting reply to:", message);
    setReplyTo(message);
    setPopupMenu({ visible: false, messageId: null, position: { x: 0, y: 0 } });
    const inputElement = document.querySelector('.message-input input[type="text"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  };

  const handleSendReply = async () => {
    if (!newMessage.trim() || !currentUser || !selectedUser || !replyTo) return;

    try {
      const conversationId = [currentUser._id, selectedUser._id].sort().join('-');
      
      const res = await fetch("http://localhost:4000/message/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          senderId: currentUser._id,
          content: newMessage,
          replyToId: replyTo._id
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to send reply');
      }

      const messageData = await res.json();
      
      const newMsg = {
        ...messageData,
        isSentByCurrentUser: true
      };
      
      setMessages(prev => [...prev, newMsg]);
      
      // Emit reply through socket
      console.log('Emitting reply:', newMsg);
      socket?.emit('send_reply', newMsg);

      setNewMessage("");
      setReplyTo(null);
      scrollToBottom();
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

  return (
    <>
      <Nav />
      <MessageList 
        users={filteredUsers} 
        onUserSelect={handleUserSelect} 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
      />

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
              <MessageBubble 
                key={message._id} 
                message={message} 
                currentUser={currentUser!} 
                selectedUser={selectedUser!} 
                handleReply={handleReply} 
                handleMoreOptions={handleMoreOptions} 
              />
            ))}
            <div ref={messageEndRef} />
          </div>

          {selectedFile && (
            <div className="media-preview">
              {selectedFile.type === 'image' ? (
                <img src={selectedFile.preview} alt="Preview" />
              ) : (
                <video src={selectedFile.preview} controls />
              )}
              <button onClick={clearFilePreview} className="clear-preview">
                <FontAwesomeIcon icon={faTimes} />
              </button>
              <button onClick={handleSendMediaMessage} className="send-media">
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          )}

          <div className="message-input">
            {replyTo && (
              <div className="reply-preview-container">
                <div className="reply-preview">
                  <span>Replying to {replyTo.senderId.firstName} {replyTo.senderId.lastName}</span>
                  <p>{replyTo.content}</p>
                </div>
                <button onClick={() => setReplyTo(null)}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            )}
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (replyTo) {
                    handleSendReply();
                  } else {
                    handleSendMessage();
                  }
                }
              }}
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

            <button onClick={replyTo ? handleSendReply : handleSendMessage}>
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

      {popupMenu.visible && (
        <PopupMenu 
          position={popupMenu.position}
          messageId={popupMenu.messageId}
          handleReply={handleReply}
          handleDeleteMessage={handleDeleteMessage}
          messages={messages}
        />
      )}
    </>
  );
}

