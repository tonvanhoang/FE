'use client'
import { useEffect, useState } from "react"
import "../../detailPostIndividual/cssdetail.css"
import Link from "next/link";
import ShowAccount from "../../componentAccount/image";
import ShowName from "../../componentAccount/name";
import { toast } from "react-toastify";
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
  const [likes, setLikes] = useState<{ [key: string]: { count: number; likedBy: string[] } }>({}); // Lưu trữ số lượt thích và người dùng đã thích
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
};
  useEffect(() => {
    const dataUser = localStorage.getItem('user');
    if (dataUser) {
      const parsedUser: User = JSON.parse(dataUser);
      setUser(parsedUser);
    }
  }, []);
  useEffect(() => {
    const detailPost = async () => {
      const res = await fetch(`http://localhost:4000/post/postByID/${params.id}`);
      const data = await res.json();
      setPost(data);
       // Khôi phục số lượt thích từ localStorage
       const storedLikes = localStorage.getItem('likes');
       if (storedLikes) {
         setLikes(JSON.parse(storedLikes));
       }
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
                  <i className="fa-regular fa-heart" onClick={() => clickFavorite(detailPost._id)}></i>
                  <Link href={`/user/detailPost/${detailPost._id}`}><i className="fa-regular fa-comment"></i></Link>
                  <i className="fa-regular fa-paper-plane"></i>
                </div>

                <div className="contentTitle">
                  <a className="luotThich d-block text-decoration-none text-black" href="#">
                  {likes[detailPost._id]?.count || 0} lượt thích        
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
