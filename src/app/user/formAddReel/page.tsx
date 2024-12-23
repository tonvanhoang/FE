"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./addReel.css";

const CLOUDINARY_UPLOAD_PRESET = "reel_load_preset_0123";
const CLOUDINARY_CLOUD_NAME = "dqso33xek";

const API_URL = "http://localhost:4000";

const UploadReel = () => {
  const router = useRouter();
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [video, setVideo] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    firstName: string;
    lastName: string;
    avatar: string;
  } | null>(null);

  // Lấy thông tin người dùng
  useEffect(() => {
    const fetchUserInfo = async () => {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      try {
        const userData = JSON.parse(userStr);
        const response = await fetch(
          `http://localhost:4000/account/accountByID/${userData._id}`
        );
        if (!response.ok) throw new Error("Failed to fetch user info");
        const data = await response.json();
        setUserInfo({
          firstName: data.firstName,
          lastName: data.lastName,
          avatar: `/img/${data.avata}`,
        });
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  // Chọn video 
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVideo(e.target.files[0]);
    }
  };

  // Xử lý tải lên video
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      if (!video) {
        alert("Vui lòng chọn video");
        return;
      }

      // Lấy thông tin user từ localStorage
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        alert("Vui lòng đăng nhập để upload reel");
        return;
      }

      // Parse user data để lấy _id
      const userData = JSON.parse(userStr);
      const userId = userData._id;

      if (!userId || !userInfo) {
        alert("Không tìm thấy thông tin người dùng");
        return;
      }

      // Upload video to Cloudinary
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", video);
      cloudinaryFormData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
        {
          method: "POST",
          body: cloudinaryFormData,
        }
      );

      const cloudinaryData = await cloudinaryResponse.json();

      if (!cloudinaryResponse.ok) {
        throw new Error(`Lỗi Cloudinary: ${JSON.stringify(cloudinaryData)}`);
      }

      // Save to MongoDB với idAccount và thông tin user
      const reelData = {
title,
        content,
        idAccount: userId,
        firstName: userInfo.firstName, // Lấy từ userInfo đã fetch
        lastName: userInfo.lastName, // Lấy từ userInfo đã fetch
        avata: userInfo.avatar, // Lấy từ userInfo đã fetch
        video: cloudinaryData.secure_url,
        dateReel: new Date().toISOString().split("T")[0],
        likes: 0,
        likedBy: [],
        comments: 0,
        views: 0,
      };

      const response = await fetch("http://localhost:4000/reel/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reelData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi khi lưu reel");
      }

      alert("Upload reel thành công!");
      router.push("/user/reelPage");
    } catch (error) {
      console.error("Lỗi khi upload reel:", error);
      alert("Đã xảy ra lỗi khi upload reel");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container">
      <div className="upload-form-wrapper">
        {userInfo && (
          <div className="user-info">
            <img src={userInfo.avatar} alt="User avatar" className="avatar" />
            <h3>
              {userInfo.firstName} {userInfo.lastName}
            </h3>
          </div>
        )}
        <form className="upload-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tiêu đề:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Nội dung:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>
          <div className="form-group">
            <label>Chọn video:</label>
            <div className="file-input">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                required
              />
            </div>
          </div>
          <button
            className="submit-button"
            type="submit"
            disabled={isUploading}
          >
            {isUploading ? "Đang tải lên..." : "Tải lên Reel"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadReel;