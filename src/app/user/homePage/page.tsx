'use client'

import React, { useEffect, useState } from "react";
import Nav from "../navbar/page";
import Suggestion from "../suggestion/page";
import '../homePage/home.css';
import Friend from "../friend/page";
import Link from "next/link";
import ShowAccountByPost from "./image";
import ShowNameByPost from "./name";
import { toast } from "react-toastify";
import ShowFavorite from "./[id]/favorite";
import ShowHeart from "./[idd]/icon";
import { io } from "socket.io-client";
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avata: string;
}

interface Post {
  _id: string;
  post: string[]; // Mảng lưu tên file ảnh
  title: string;
  datePost: string;
  idAccount: string;
}

export default function HomePage() {
  const [showLinkPost, setShowLinkPost] = useState<boolean>(false);
  const [links, setLink] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number[]>([]);
  const [comment, setComment] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);

  // Lấy thông tin người dùng từ localStorage
  useEffect(() => {
    const dataUser = localStorage.getItem('user');
    if (dataUser) {
      const parsedUser: User = JSON.parse(dataUser);
      setUser(parsedUser);
    }
  }, []);
  useEffect(() => {
    const socket = io("http://localhost:4000");
    socket.on('newNotification', (notification) => {
        if (notification.idAccount === user?._id) {
            toast.success(`New notification: ${notification.content}`);
        }
    });
    return () => {
        socket.disconnect(); // Ngắt kết nối khi component bị unmount
    };
}, [user]);
  // Fetch data từ API khi user thay đổi
  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        const res = await fetch(`http://localhost:4000/post/friendsPosts/${user._id}`);
        const dataPosts = await res.json();
        setPosts(dataPosts);
        setCurrentImageIndex(new Array(dataPosts.length).fill(0)); // Khởi tạo chỉ số hình ảnh hiện tại cho từng bài viết
      }
    };
    fetchPosts();
  }, [user]);

  const addComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const newComment = {
      comment: comment,
      idPost: postId,
      idAccount: user?._id,
    };
    const res = await fetch("http://localhost:4000/comment/addpost", {
      headers: {
        'Content-Type': "application/json"
      },
      method: "POST",
      body: JSON.stringify(newComment)
    });

    if (res.ok) {
      setComment('');
      const resPostDetail = await fetch(`http://localhost:4000/post/postByID/${postId}`)
      const dataPost = await resPostDetail.json()
      if (user?._id !== dataPost.idAccount) {
        const newNoTi = {
          idPost: dataPost._id,
          owner: user?._id,
          idAccount: dataPost.idAccount,
          content: "Đã Bình luận bài viết của bạn",
          type: "post"
        }
        const resNoti = await fetch(`http://localhost:4000/notification/addPost`, {
          headers: {
            'content-type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify(newNoTi)
        })
      }
    }
  };

  // Xử lý sự kiện nhấn nút Next/Prev và cập nhật trạng thái
  const handleNextImage = (postIndex: number, imagesLength: number) => {
    setCurrentImageIndex(prev => {
      const updatedIndexes = [...prev];
      updatedIndexes[postIndex] = (updatedIndexes[postIndex] + 1) % imagesLength;
      return updatedIndexes;
    });
  };

  const handlePrevImage = (postIndex: number, imagesLength: number) => {
    setCurrentImageIndex(prev => {
      const updatedIndexes = [...prev];
      updatedIndexes[postIndex] = (updatedIndexes[postIndex] - 1 + imagesLength) % imagesLength;
      return updatedIndexes;
    });
  };

  function showLink(id: string) {
    setShowLinkPost(true);
    setLink(id)
  }

  // Hàm để sao chép nội dung
  const copyToClipboard = () => {
    const textToCopy = `http://localhost:3000/user/detailPost/${links}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        alert("Đã sao chép vào clipboard!");
      })
      .catch(err => {
        console.error("Không thể sao chép: ", err);
      });
  };

  return (
    <>
      <Nav />
      <div className="containerPost">
        <div className="postLeft">
          <Friend />
          {/* Bài viết */}
          <div id="Post">
            {posts.map((post: any, postIndex) => (
              <div className="item" key={post._id}>
                <div className="d-flex">
                  <div className="img">
                    <ShowAccountByPost params={{ id: post.idAccount._id }} />
                  </div>
                  <div className="content d-flex">
                    <ShowNameByPost params={{ id: post.idAccount._id }} />
                    <span>{post.datePost}</span>
                  </div>
                </div>

                <div className="post-images">
                  {post.post.map((img: any, imgIndex: any) => (
                    <img
                      key={imgIndex}
                      src={`/img/${img}`}
                      alt={`Post Image ${imgIndex + 1}`}
                      className={imgIndex === currentImageIndex[postIndex] ? 'active' : ''}
                    />
                  ))}
                  {/* Chỉ báo hình ảnh */}
                  <div className="image-indicators">
                    {post.post.map((_: any, imgIndex: any) => (
                      <span
                        key={imgIndex}
                        className={`image-indicator ${imgIndex === currentImageIndex[postIndex] ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(prev => {
                          const updatedIndexes = [...prev];
                          updatedIndexes[postIndex] = imgIndex;
                          return updatedIndexes;
                        })}
                      ></span>
                    ))}
                  </div>

                  {/* Nút điều hướng */}
                  {post.post.length > 1 && (
                    <div className="post-navigation">
                      <a
                        className="carousel-control-prev-icon prev-btn"
                        onClick={() => handlePrevImage(postIndex, post.post.length)}
                      ></a>
                      <a
                        className="carousel-control-next-icon next-btn"
                        onClick={() => handleNextImage(postIndex, post.post.length)}
                      ></a>
                    </div>
                  )}
                </div>

                <div className="containerIcon">
                  <ShowHeart params={{ id: post._id }} />
                  <Link href={`/user/detailPost/${post._id}`}>
                    <i className="fa-regular fa-comment"></i>
                  </Link>
                  <i className="fa-regular fa-paper-plane" onClick={() => showLink(post._id)}></i>
                </div>
                <div className="contentTitle">
                  <ShowFavorite params={{ id: post._id }} />
                  <div className="titlePost">
                    <label style={{ marginRight: "5px" }}>
                      <ShowNameByPost params={{ id: post.idAccount._id }} />
                    </label>
                    <span>{post.title}</span>
                  </div>
                </div>
                <div className="inPutThemBL">
                  <div className="d-flex">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="form-control"
                      placeholder="Thêm bình luận..."
                    />
                    <button type="submit" onClick={(e) => addComment(e, post._id)}>
                      Đăng
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Suggestion />
      </div>
      {showLinkPost && (
        <div className="linkPost">
          <div className="d-flex align-self-center">
            <p className="m-0">http://localhost:3000/user/detailPost/{links}</p>
            <button className="btnCopy" onClick={copyToClipboard}>Copy</button>
          </div>
          <div className="" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <button className="btnClose" onClick={() => setShowLinkPost(false)}>Đóng</button>
          </div>
        </div>
      )}
    </>
  );
}