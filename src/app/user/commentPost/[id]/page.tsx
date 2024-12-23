'use client'
import React, { FormEvent, useEffect, useState } from "react"
import ShowAccount from "../../componentAccount/image";
import ShowName from "../../componentAccount/name";
import Link from "next/link";
import { toast } from "react-toastify";
import '../../commentPost/formRep.css'
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avata:string
}
export default function CommentPost({params}:{params:{id:string}}){
    const [showLinkPost, setShowLinkPost] = useState<boolean>(false);
      const [links,setLink] = useState<any>(null)
  const [user,setUser] = useState<User|null>(null)
    const [comments,setComments] = useState<any>([])
    const [comment,setComment] = useState('');
    const [likes, setLikes] = useState<{ [key: string]: { count: number; likedBy: string[] } }>({}); // Lưu trữ số lượt thích và người dùng đã thích
    const [post,setPost] = useState<any>(null)
    const [text,setText] = useState<any>('')
        const fetchComment = async ()=>{
            const res = await fetch(`http://localhost:4000/comment/commentByPost/${params.id}`)
            const data = await res.json()
            setComments(data)
          }
        useEffect(()=>{
          fetchComment()
        },[params.id])
        // local tài khoản
        useEffect(()=>{
          const showData = localStorage.getItem('user')
          if(showData){
            setUser(JSON.parse(showData))
          }
        },[])
    const addComment = async (e:React.FormEvent)=>{
      e.preventDefault();
      const newComment = {
      comment:comment,
      idPost:params.id,
      idAccount:user?._id
    }
    const res = await fetch("http://localhost:4000/comment/addpost",{
    method:"POST",
    headers:{
    "content-Type":"application/json"
    },
    body:JSON.stringify(newComment)
    });
    if(res.ok){
      fetchComment()
      setComment('')
      const resPostDetail = await fetch(`http://localhost:4000/post/postByID/${params.id}`)
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
  }
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
  useEffect (()=>{
    const fetchAccount  = async ()=>{
      const res = await fetch(`http://localhost:4000/post/postByID/${params.id}`)
      const data = await res.json()
      setPost(data)
       // Khôi phục số lượt thích từ localStorage
       const storedLikes = localStorage.getItem('likes');
       if (storedLikes) {
         setLikes(JSON.parse(storedLikes));
       }
    }
    fetchAccount()
  },[params.id])
  // báo cáo
  const btnReport = async (e:React.FormEvent) =>{
    const resPost = await fetch(`http://localhost:4000/post/postByID/${params.id}`)
    const dataPost = await resPost.json()
    e.preventDefault()
    const newData = {
      idAccount:user?._id,
      idPost:params.id,
      owner:dataPost.idAccount,
      content:"Xem xét nội dung bài viết có nội dung phản cảm!"
    }
    if(user?._id===dataPost.idAccount){
      alert('Bạn không thể tự báo cáo bài viết của mình!')
    }
    else{
      const res = await fetch(`http://localhost:4000/report/add`,{
        headers:{
          'content-type':'application/json'
        },
        body:JSON.stringify(newData),
        method:'POST'
      })
      if(res.ok){
        alert('Bạn đã báo cáo bài viết thành công')
      }
    }
    
  }
  const btnRepComment = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    const newRep = {
      idAccount: user?._id,
      text: text, // Văn bản trả lời
    };
    const res = await fetch(`http://localhost:4000/comment/repPost/${id}`, {
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(newRep),
    });
    if (res.ok) {
      await fetchComment(); // Cập nhật danh sách bình luận
      setText(''); // Xóa nội dung ô nhập sau khi gửi thành công
      const show = document.getElementById('InputComment') as HTMLElement;
      if (show) {
        show.style.display = 'none';
      }
    }
  };
  
  function showInputepComment(){
  const show = (document.getElementById('InputComment')as HTMLElement)
      if(show){
      show.style.display='block'
      }
  }
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
  const deletePost = async (id:string) =>{
    const res = await fetch(`http://localhost:4000/post/delete/${id}`,{
      headers:{
        'content-type':'application/json'
      },
      method:'DELETE'
    })
    if(res.ok){
      alert('xóa thành công')
      location.href = '/user/homePage'
    }
  }
    return(
        <>
        {/* Phần bình luận */}
        <div className="detailLeft">
        {
  post && (
    <>
      <div className="avatarPost">
        <div className="d-flex justify-content-between">
          <div>
            <ShowAccount params={{ id: post.idAccount }} />
            <ShowName params={{ id: post.idAccount }} />
          </div>
          <div>
            {
              user?._id === post.idAccount ? (
                <button
                  type="button"
                  className="bg-danger text-white border py-1 px-3 mx-2 btn-Delete"
                  onClick={()=>(deletePost(post._id))} >
                  Xóa bài viết
                </button>
              ) : (
                <button
                  type="button"
                  className="bg-danger text-white border py-1 px-3 mx-2 btn-Report"
                  onClick={btnReport}
                >
                  Báo cáo
                </button>
              )
            }
          </div>
        </div>
      </div>
    </>
  )
}

          <div className="containerComment">
  {
    comments.map((cmt: any) => (
      <div className="commentdetail" key={cmt._id}>
        <div className="avatarUser">
          <div className="img">
            <ShowAccount params={{ id: cmt.idAccount }} />
          </div>
          <div className="content">
            <Link href={`/user/profilePage/${cmt.idAccount}`}>
              <ShowName params={{ id: cmt.idAccount }} />
            </Link>
            <label>{cmt.comment}</label>
          </div>
        </div>
        <div className="repComment">
          <span>{cmt.dateComment}</span>
          <a href="#" onClick={showInputepComment}>Trả lời</a>
          <form action="" id="InputComment">
          <input
              type="text"
              id="InputRep"
              value={text} // Đồng bộ giá trị của input với trạng thái `text`
              onChange={(e) => setText(e.target.value)} // Cập nhật trạng thái khi người dùng nhập
            />
            <button type="submit" onClick={(e)=>btnRepComment(e,cmt._id)}>Gửi</button>
          </form>
        </div>
        {
          cmt.repComment && (
            <div className="repCommentSection mx-5">
              {cmt.repComment.map((rep: any) => (
                <div className="avatarUser my-2" key={rep._id}>
                  <div className="img">
                    <ShowAccount params={{ id: rep.idAccount }} />
                  </div>
                  <div className="content">
                    <Link href={`/user/profilePage/${rep.idAccount}`}>
                      <ShowName params={{ id: rep.idAccount }} />
                    </Link>
                    <label>{rep.text} {rep.date}</label>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    ))
  }
</div>
          {
            post && (
              <>
              <div className="containerIcon">
            <i className="fa-regular fa-heart" onClick={() => clickFavorite(post._id)}></i>
            <i className="fa-regular fa-comment"></i>
            <i className="fa-regular fa-paper-plane" onClick={()=>showLink(post._id)}></i>
            <span className="d-block">
            {likes[post._id]?.count || 0} lượt thích
            </span>
          </div>
          <div className="inPutThemBL">
            <div className="d-flex">
              <input onChange={(e)=>setComment(e.target.value)}
                type="text"
                value={comment}
                className="form-control"
                placeholder="Thêm bình luận..."

              />
              <i className="fa-solid fa-face-smile"></i>
              <button type="submit" onClick={addComment}><a href="#">Đăng</a></button>
            </div>
          </div>
              </>
            )
          }
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
    )
}