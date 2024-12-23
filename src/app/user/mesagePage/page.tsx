"use client";
import { useEffect, useState } from "react";
import "../mesagePage/mesage.css";
import Nav from "../navbar/page";
import { io } from "socket.io-client";
import ShowAccount from "../componentAccount/image";
import Link from "next/link";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  avata: string;
}
interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isSentByCurrentUser: boolean;
}

export default function MessagePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Khởi tạo socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:4000");
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
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Handle gửi tin nhắn
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !selectedUser) return;
    try {
      const res = await fetch("http://localhost:4000/message/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: currentUser._id,
          receiverId: selectedUser._id,
          content: newMessage,
        }),
      });

      if (res.ok) {
        const messageData = await res.json();
        const newMsg = {
          ...messageData,
          isSentByCurrentUser: true,
        };
        setMessages((prev) => [...prev, newMsg]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Lọc danh sách người dùng theo tên
  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
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
              <div
                key={message._id}
                className={`message ${
                  message.isSentByCurrentUser ? "sent" : "received"
                }`}
              >
                <div className="message-user-info">
                  <ShowAccount params={{ id: selectedUser._id }} />
                  <span className="message-username">
                    {message.isSentByCurrentUser
                      ? `${currentUser?.firstName} ${currentUser?.lastName}`
                      : `${selectedUser?.firstName} ${selectedUser?.lastName}`}
                  </span>
                </div>
                <div className="message-bubble">
                  <p>{message.content}</p>
                  <span className="timestamp">
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="message-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      ) : (
        <div className="message-container">
          <div className="select-chat">
            <h3>Chọn một người để bắt đầu cuộc trò chuyện</h3>
          </div>
        </div>
      )}
    </>
  );
}
