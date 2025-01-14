'use client'
import React, { FormEvent, useEffect, useRef, useState } from "react";
import ShowAccount from "../../componentAccount/image";
import ShowName from "../../componentAccount/name";
import Link from "next/link";
import '../../commentPost/formRep.css';
import ShowFavorite from "../../homePage/[id]/favorite";
import ShowHeart from "../../homePage/[idd]/icon";
import { io } from "socket.io-client";
import FormPrivate from "./formprivate";
import { toast } from "react-toastify";

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avata: string;
}

interface Comment {
  _id: string;
  comment: string;
  idAccount: string;
  dateComment: string;
  repComment: Reply[];
}

interface Reply {
  _id: string;
  idAccount: string;
  text: string;
  date: string;
}

export default function CommentPost({ params }: { params: { id: string } }) {
  const [showLinkPost, setShowLinkPost] = useState<boolean>(false);
  const [links, setLink] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState('');
  const [post, setPost] = useState<any>(null);
  const [accounts, setAccounts] = useState<{ [key: string]: User }>({});
  const [accountRepComment, setAccountRepComment] = useState<{ [key: string]: User }>({});
  const [text, setText] = useState<{ [key: string]: string }>({});
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>({});
  const socket = io("http://localhost:4000"); // Set up Socket.IO client connection
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Fetch comments
  const fetchComment = async () => {
    const res = await fetch(`http://localhost:4000/comment/commentByPost/${params.id}`);
    const data = await res.json();
    setComments(data);
    data.forEach((cmt: Comment) => {
      ShowAccountByComment(cmt.idAccount);
      cmt.repComment.forEach((rep: Reply) => {
        ShowAccountByRepComment(rep.idAccount);
      });
    });
  };

  const ShowAccountByComment = async (id: string) => {
    const res = await fetch(`http://localhost:4000/account/accountByID/${id}`);
    const data = await res.json();
    setAccounts((prevAccounts) => ({ ...prevAccounts, [id]: data }));
  };
  const ShowAccountByRepComment = async (id: string) => {
    const res = await fetch(`http://localhost:4000/account/accountByID/${id}`);
    const data = await res.json();
    setAccountRepComment((prevAccounts) => ({ ...prevAccounts, [id]: data }));
  }
  useEffect(() => {
    fetchComment();
    socket.emit('commentsFetched', params.id); // Emit event to fetch comments on mount
  }, [params.id]);

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
  }, [params.id, user]);
  // Fetch user from localStorage
  useEffect(() => {
    const showData = localStorage.getItem('user');
    if (showData) {
      setUser(JSON.parse(showData));
    }
  }, []);

  // Add a new comment or reply and emit it to the server via Socket.IO
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (replyTo) {
      const newRep = {
        idAccount: user?._id,
        text: comment, // Use the same input for reply text
        commentId: replyTo // Add commentId to the newRep object
      };
      const res = await fetch(`http://localhost:4000/comment/repPost/${replyTo}`, {
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(newRep),
      });
      if (res.ok) {
        const createdReply = await res.json();
        socket.emit("newReply", createdReply);  // Emit reply event with commentId
        setComments(prevComments =>
          prevComments.map(comment =>
            comment._id === createdReply.commentId ? { ...comment, repComment: [createdReply, ...comment.repComment] } : comment
          )
        );
        ShowAccountByRepComment(createdReply.idAccount); // Fetch account info for the new reply
        setComment(''); // Clear the comment input
        setReplyTo(null); // Reset replyTo state
      }
    } else {
      const newComment = {
        comment: comment,
        idPost: params.id,
        idAccount: user?._id
      };
      const res = await fetch("http://localhost:4000/comment/addpost", {
        method: "POST",
        headers: {
          "content-Type": "application/json"
        },
        body: JSON.stringify(newComment)
      });
      if (res.ok) {
        const createdComment = await res.json();
        socket.emit("newComment", createdComment); // Emit new comment event
        setComment(''); // Clear the comment input
        const resPostDetail = await fetch(`http://localhost:4000/post/postByID/${params.id}`);
        const dataPost = await resPostDetail.json();
        // Nếu người dùng không phải là chủ sở hữu bài viết, gửi thông báo yêu thích
        if (user?._id !== dataPost.idAccount) {
          const newNoTi = {
            idAccount: dataPost.idAccount,
            idPost: dataPost._id,
            owner: user?._id,
            content: 'Đã yêu bình luận bài viết của bạn❤️',
            type: "post"
          };
          await fetch(`http://localhost:4000/notification/addPost`, {
            headers: {
              'content-type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(newNoTi),
          });
        }
        toast.success('Đã yêu thích bài viết.');
      }
    }
  };

  // Listen for new comments (real-time updates)
  useEffect(() => {
    socket.on("newComment", async (newComment: Comment) => {
      setComments((prevComments) => [newComment, ...prevComments]);
      ShowAccountByComment(newComment.idAccount); // Fetch account info for the new comment
    });

    return () => {
      socket.off("newComment");
    };
  }, []);

  // Listen for account details
  useEffect(() => {
    socket.on("accountDetails", (account: User) => {
      setAccounts((prevAccounts) => ({ ...prevAccounts, [account._id]: account }));
    });

    return () => {
      socket.off("accountDetails");
    };
  }, []);

  // Listen for comments by post (real-time updates)
  useEffect(() => {
    socket.on("commentsByPost", (comments: Comment[]) => {
      setComments(comments);
      comments.forEach((cmt: Comment) => {
        ShowAccountByComment(cmt.idAccount);
      });
    });

    return () => {
      socket.off("commentsByPost");
    };
  }, []);

  // Report a post
  const btnReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const resPost = await fetch(`http://localhost:4000/post/postByID/${params.id}`);
    const dataPost = await resPost.json();
    const newData = {
      idAccount: user?._id,
      idPost: params.id,
      owner: dataPost.idAccount,
      content: "Xem xét nội dung bài viết có nội dung phản cảm!"
    };
    if (user?._id === dataPost.idAccount) {
      alert('Bạn không thể tự báo cáo bài viết của mình!');
    } else {
      const res = await fetch("http://localhost:4000/report/add", {
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(newData),
        method: 'POST'
      });
      if (res.ok) {
        socket.emit("newReport", newData); // Emit report event
        alert('Bạn đã báo cáo bài viết thành công');
      }
    }
  };

  // Listen for new reports (real-time updates)
  useEffect(() => {
    socket.on("newReport", (reportData: any) => {
      toast.info('A new report has been submitted.');
    });

    return () => {
      socket.off("newReport");
    };
  }, []);
  // Fetch post details
  useEffect(() => {
    const fetchPost = async () => {
      const res = await fetch(`http://localhost:4000/post/postByID/${params.id}`);
      const data = await res.json();
      setPost(data);
    };
    fetchPost();
  }, [params.id]);

  // Listen for new replies (real-time updates)
  useEffect(() => {
    socket.on("replyAdded", (newReply: any) => {
      setComments(prevComments =>
        prevComments.map(comment =>
          comment._id === newReply.commentId ? { ...comment, repComment: [newReply, ...comment.repComment] } : comment
        )
      );
      ShowAccountByRepComment(newReply.idAccount); // Fetch account info for the new reply
    });

    return () => {
      socket.off("replyAdded");
    };
  }, []);

  // Show the input for reply
  function showInputepComment(id: string) {
    setReplyTo(id);
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }

  // Toggle the visibility of replies for a comment
  function toggleReplies(id: string) {
    setShowReplies(prev => ({ ...prev, [id]: !prev[id] }));
  }

  // Show the link to post
  function showLink(id: string) {
    setShowLinkPost(true);
    setLink(id);
  }

  // Copy link to clipboard
  const copyToClipboard = () => {
    if (links) {
      const textToCopy = `http://localhost:3000/user/detailPost/${links}`;
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          alert("Đã sao chép vào clipboard!");
        })
        .catch(err => {
          console.error("Không thể sao chép: ", err);
        });
    }
  };

  const showOptionPost = () => {
    let ulposst = document.getElementById('ul_post') as HTMLElement;
    if (ulposst) {
      ulposst.style.display = ulposst.style.display === 'block' ? 'none' : 'block';
    }
  };

  const showPrivate = () => {
    let formprivate = document.getElementById('formprivate') as HTMLElement;
    if (formprivate) {
      formprivate.style.display = 'block';
    }
  }

  // Delete post
  const deletePost = async (id: string) => {
    const res = await fetch(`http://localhost:4000/post/delete/${id}`, {
      headers: {
        'content-type': 'application/json'
      },
      method: 'DELETE'
    });
    if (res.ok) {
      socket.emit("postDeleted", id); // Emit post delete event
      alert('xóa thành công');
      location.href = '/user/homePage';
    }
  };


  return (
    <>
      <div className="detailLeft">
        {post && (
          <>
            <div className="avatarPost">
              <div className="d-flex justify-content-between">
                <div>
                  <ShowAccount params={{ id: post.idAccount }} />
                  <ShowName params={{ id: post.idAccount }} />
                </div>
                <div>
                  <i className="bi bi-three-dots-vertical" id="tuychon" onClick={showOptionPost}></i>
                  <ul className="ul_post" id="ul_post">
                    {
                      user?._id === post.idAccount ? (
                        <>
                          <li><a href="#" onClick={showPrivate}>Chỉnh sửa quyền riêng tư</a></li>
                          <li><a href="#" onClick={() => (deletePost(post._id))}>Xóa bài viết</a></li>
                        </>
                      ) : (
                        <li><a href="#" onClick={btnReport}>Báo cáo bài viết</a></li>
                      )
                    }
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="containerComment">
          {comments.map((cmt: Comment) => (
            <div className="commentdetail" key={cmt._id}>
              <div className="avatarUser">
                <div className="img">
                  {
                    accounts[cmt.idAccount] && (
                      <Link href={`/user/profilePage/${cmt.idAccount}`}>
                        <img src={`/img/${accounts[cmt.idAccount].avata}`} alt="" />
                      </Link>
                    )
                  }
                </div>
                <div className="content">
                  <div className="d-flex">
                    {
                      accounts[cmt.idAccount] && (
                        <Link href={`/user/profilePage/${cmt.idAccount}`}>
                          <span>{accounts[cmt.idAccount].firstName} {accounts[cmt.idAccount].lastName}</span>
                        </Link>
                      )
                    }
                    <div className="comment">
                      <label>{cmt.comment}</label>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="dateComment">{cmt.dateComment}</span>
                    <a href="#" onClick={() => toggleReplies(cmt._id)} className="d-block" style={{ marginLeft: '10px', color: 'gray', fontSize: '14px', fontWeight: '500' }}>Xem phản hồi</a>
                    <a href="#" onClick={() => showInputepComment(cmt._id)} className="d-block" style={{ marginLeft: '10px', color: 'gray', fontSize: '14px', fontWeight: '500' }}>Trả lời</a>
                  </div>
                </div>
              </div>
              {showReplies[cmt._id] && cmt.repComment && (
                <div className="repCommentSection mx-5">
                  {cmt.repComment.map((rep: Reply) => (
                    <div className="avatarUser my-2" key={rep._id}>
                      <div className="img">
                        {accountRepComment[rep.idAccount] && (
                          <Link href={`/user/profilePage/${rep.idAccount}`}>
                            <img src={`/img/${accountRepComment[rep.idAccount].avata}`} alt="" />
                          </Link>
                        )}
                      </div>
                      <div className="content">
                        {accountRepComment[rep.idAccount] && (
                          <Link href={`/user/profilePage/${rep.idAccount}`}>
                            <span>{accountRepComment[rep.idAccount].firstName} {accountRepComment[rep.idAccount].lastName}</span>
                            <label htmlFor="" style={{ marginLeft: '5px' }}>{rep.text} </label>
                          </Link>
                        )}
                        <i>{rep.date}</i>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {post && (
          <>
            <div className="containerIcon">
              <ShowHeart params={{ id: post._id }} />
              <i className="fa-regular fa-comment"></i>
              <i className="fa-regular fa-paper-plane" onClick={() => showLink(post._id)}></i>
              <span className="d-block">
                <ShowFavorite params={{ id: post._id }} />
              </span>
            </div>
            <div className="inPutThemBL">
              <div className="d-flex">
                <input
                  ref={commentInputRef}
                  onChange={(e) => setComment(e.target.value)}
                  type="text"
                  value={comment}
                  className="form-control"
                  placeholder={replyTo ? "Trả lời bình luận..." : "Thêm bình luận..."}
                />
                <i className="fa-solid fa-face-smile"></i>
                <button type="submit" onClick={handleSubmit}><a href="#">Đăng</a></button>
              </div>
            </div>
            <FormPrivate params={{ id: post._id }} />
          </>
        )}
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