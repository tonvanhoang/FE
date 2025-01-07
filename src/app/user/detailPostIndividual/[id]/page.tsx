'use client'
import { useEffect, useState } from "react"
import "../../detailPostIndividual/cssdetail.css"
import Link from "next/link";
import ShowAccount from "../../componentAccount/image";
import ShowName from "../../componentAccount/name";
import { toast } from "react-toastify";
import ShowFavorite from "../../homePage/[id]/favorite";
import ShowHeart from "../../homePage/[idd]/icon";
import { io } from "socket.io-client";
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avata: string;
}
export default function DetailpostIndividual({ params }: { params: { id: string } }) {
  const [detailPost, setPost] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0); // Sử dụng biến duy nhất để quản lý chỉ số ảnh
  const [comment, setComment] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
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
  useEffect(() => {
    const detailPost = async () => {
      const res = await fetch(`http://localhost:4000/post/postByID/${params.id}`);
      const data = await res.json();
      setPost(data);
    }
    detailPost();
  },[params.id]);
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
    } else {
      alert('Thêm bình luận thất bại');
    }
  };
  const handleNextImage = (imagesLength: number) => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imagesLength);
  };

  const handlePrevImage = (imagesLength: number) => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imagesLength) % imagesLength);
  };

  return (
          <>
          {
            detailPost && (
              <div className="detailPostIndividual" id="detailPost">
        <Link href={`/user/profilePage/${detailPost.idAccount}`}>
        <i id="closeCart" className="bi bi-x-lg"></i>
        </Link>
        <div className="postLeft">
              <div className="item">
                <Link className="text-decoration-none" href={`/user/profilePage/${detailPost.idAccount}`}>
                <div className="d-flex">
                  <div className="img">
                    <ShowAccount params={{id:detailPost.idAccount}} />
                  </div>
                  <div className="content d-flex">
                    <ShowName params={{id:detailPost.idAccount}} />
                    <span>{detailPost.datePost}</span>
                  </div>
                </div>
                </Link>
                <div className="post-images">
                  <img
                    src={`/img/${detailPost.post[currentImageIndex]}`}
                    alt={`Post Image ${currentImageIndex + 1}`}
                    className="active"
                  />
                  <div className="image-indicators">
                    {detailPost.post.map((_: any, imgIndex: number) => (
                      <span
                        key={imgIndex}
                        className={`image-indicator ${imgIndex === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(imgIndex)}
                      ></span>
                    ))}
                  </div>
                  <div className="post-navigation">
                    <a
                      className="carousel-control-prev-icon prev-btn"
                      onClick={() => handlePrevImage(detailPost.post.length)}
                    ></a>
                    <a
                      className="carousel-control-next-icon next-btn"
                      onClick={() => handleNextImage(detailPost.post.length)}
                    ></a>
                  </div>
                </div>

                <div className="containerIcon">
                  <ShowHeart params={{id:detailPost._id}} />
                  <Link href={`/user/detailPost/${detailPost._id}`}><i className="fa-regular fa-comment"></i></Link>
                  <i className="fa-regular fa-paper-plane"></i>
                </div>

                <div className="contentTitle">
                  <a className="luotThich d-block text-decoration-none text-black" href="#">
                  <ShowFavorite params={{id:detailPost._id}} />    
                 </a>
                  <a className="titlePost" href="#">
                    <label>Hoàng Tôn</label> {detailPost.title}
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
                    <button type="submit"><a href="#" onClick={(e) => addComment(e, detailPost._id)}>Đăng</a></button>
                  </div>
                </div>
              </div>
              </div>
              </div>
            )
          }
          </>
     
  );
}
