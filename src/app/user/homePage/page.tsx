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
  const [links,setLink] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number[]>([]);
  const [comment, setComment] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [likes, setLikes] = useState<{ [key: string]: { count: number; likedBy: string[] } }>({}); // Lưu trữ số lượt thích và người dùng đã thích
  // Lấy thông tin người dùng từ localStorage
  useEffect(() => {
    const dataUser = localStorage.getItem('user');
    if (dataUser) {
      const parsedUser: User = JSON.parse(dataUser);
      setUser(parsedUser);
    }
  }, []);

  // Fetch data từ API khi user thay đổi
  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        const res = await fetch(`http://localhost:4000/post/friendsPosts/${user._id}`);
        const dataPosts = await res.json();
        setPosts(dataPosts);
        setCurrentImageIndex(new Array(dataPosts.length).fill(0)); // Khởi tạo chỉ số hình ảnh hiện tại cho từng bài viết

        // Khôi phục số lượt thích từ localStorage
        const storedLikes = localStorage.getItem('likes');
        if (storedLikes) {
          setLikes(JSON.parse(storedLikes));
        }
      }
    };
    fetchPosts();
  }, [user]);
  const addComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const newComment = {
      comment:comment,
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
      if(user?._id !== dataPost.idAccount){
        const newNoTi = {
          idPost:dataPost._id,
          owner:user?._id,
          idAccount:dataPost.idAccount,
          content:"Đã Bình luận bài viết của bạn"
        }
        const resNoti = await fetch(`http://localhost:4000/notification/addPost`,{
          headers:{
            'content-type':'application/json'
  
          },
          method:'POST',
          body:JSON.stringify(newNoTi)
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
  const clickFavorite = async (id: string) => {
    if (!user) {
        toast.error('Bạn cần đăng nhập để thích bài viết.');
        return;
    }
    // Lấy số lượt thích hiện tại và đảm bảo likedBy luôn là mảng
    const currentLikes = likes[id] || { count: 0, likedBy: [] };
    const likedBy = Array.isArray(currentLikes.likedBy) ? currentLikes.likedBy : []; // Đảm bảo likedBy là mảng
    const alreadyLiked = likedBy.includes(user._id); // Kiểm tra nếu user đã thích bài viết

    let newLikes;

    if (alreadyLiked) {
        // Nếu đã thích, trừ đi lượt thích
        newLikes = {
            count: currentLikes.count - 1,
            likedBy: likedBy.filter(userId => userId !== user._id), // Xóa user ra khỏi danh sách
        };
        toast.success('Đã bỏ thích bài viết.');
    } else {
        // Nếu chưa thích, tăng lượt thích
        newLikes = {
            count: currentLikes.count + 1,
            likedBy: [...likedBy, user._id], // Thêm user vào danh sách
        };
        toast.success('Đã thích bài viết.');
    }

    // Cập nhật state và localStorage
    const updatedLikes = { ...likes, [id]: newLikes };
    setLikes(updatedLikes);
    localStorage.setItem('likes', JSON.stringify(updatedLikes));

    // Gọi API để thêm hoặc bỏ thích (nếu cần)
    const newFavorite = {
        idAccount: user._id,
        idPost: id,
        action: alreadyLiked ? 'remove' : 'add', // Thêm hoặc bỏ
    };
    const res = await fetch(`http://localhost:4000/favorite/${alreadyLiked ? 'removePost' : 'addPost'}`, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(newFavorite)
    });

    if (!res.ok) {
        toast.error('Thao tác yêu thích thất bại.');
    }
    if(res.ok){
      const resPostDetail = await fetch(`http://localhost:4000/post/postByID/${id}`)
      const dataPost = await resPostDetail.json()
      if(user._id !==dataPost.idAccount){
        const newNoTi = {
          idAccount:dataPost.idAccount,
          idPost:dataPost._id,
          owner:user._id,
          content:"Đã yêu thích bài viết của bạn❤️"
        }
        const resNoti = await fetch(`http://localhost:4000/notification/addPost`,{
          headers:{
            'content-type':'application/json'
  
          },
          method:'POST',
          body:JSON.stringify(newNoTi)
        })
      }
    }
};
function showLink(id:string) {
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
            {posts.map((post, postIndex) => (
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
                  {post.post.map((img, imgIndex) => (
                    <img
                      key={imgIndex}
                      src={`/img/${img}`}
                      alt={`Post Image ${imgIndex + 1}`}
                      className={imgIndex === currentImageIndex[postIndex] ? 'active' : ''}
                    />
                  ))}
                  {/* Chỉ báo hình ảnh */}
                  <div className="image-indicators">
                    {post.post.map((_, imgIndex) => (
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
                </div>

                <div className="containerIcon">
                  <i className="fa-regular fa-heart" onClick={() => clickFavorite(post._id)}></i>
                  <Link href={`/user/detailPost/${post._id}`}>
                    <i className="fa-regular fa-comment"></i>
                  </Link>
                  <i className="fa-regular fa-paper-plane" onClick={()=>showLink(post._id)}></i>
                </div>

                <div className="contentTitle">
                  <a className="luotThich d-block text-decoration-none text-black" href="#">
                    {likes[post._id]?.count || 0} lượt thích
                  </a>
                  <a className="titlePost" href="#">
                    <label style={{ marginRight: "5px" }}>
                      <ShowNameByPost params={{ id: post.idAccount._id }} />
                    </label>{post.title}
                  </a>
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
    <div className="" style={{width:'100%',display:'flex',justifyContent:'center'}}>
    <button className="btnClose" onClick={() => setShowLinkPost(false)}>Đóng</button>
    </div>
  </div>
)}
    </>
  );
}
