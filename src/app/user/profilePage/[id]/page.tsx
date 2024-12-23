'use client';
import Link from "next/link";
import { useEffect, useState } from 'react';
import Nav from "../../navbar/page";
import '../../profilePage/profile.css';
import Flower from "../../follower/page";
import DangTheoDoi from "../../currentlyMonitoring/page";
import PostIndividual from "../../postIndividual/page";
import ReelIndividual from "../../reelIndividual/page";

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avata: string;
}

export default function Profile({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [friendParams, setFriendParams] = useState<any>(null);
  const [idowner,setIDOwer] = useState<any>(null)
  const [ownerID,setOwnerID] = useState<any>(null)
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(`http://localhost:4000/account/accountByID/${params.id}`);
      const data = await res.json();
      setUser(data);
    };
    fetchUser();
  }, [params.id]);

  useEffect(() => {
    const fetchQuanheParams = async () => {
      const dataUser = localStorage.getItem('user');
      if (dataUser) {
        const parsedUser: User = JSON.parse(dataUser);
        const Res = await fetch(`http://localhost:4000/friendShip/friendshipByAccountAndOwner?idAccount=${parsedUser._id}&owner=${params.id}`);
        const data = await Res.json();
        setFriendParams(data);
      }
    };
    fetchQuanheParams();
  }, [params.id]);
  useEffect(() => {
    // dang theo doi
    const fetchQuanheParams_idowner = async () => {
      const dataUser = localStorage.getItem('user');
      if (dataUser) {
        const parsedUser: User = JSON.parse(dataUser);
        const Res = await fetch(`http://localhost:4000/friendShip/idaccountbyowner?idAccount=${parsedUser._id}&owner=${params.id}`);
        const data = await Res.json();
        setIDOwer(data);
      }
    };
    fetchQuanheParams_idowner();
  }, [params.id]);
  useEffect(() => {
    const fetchQuanheParam_ownerid = async () => {
      const dataUser = localStorage.getItem('user');
      if (dataUser) {
        const parsedUser: User = JSON.parse(dataUser);
        const Res = await fetch(`http://localhost:4000/friendShip/ownerbyidaccount?idAccount=${parsedUser._id}&owner=${params.id}`);
        const data = await Res.json();
        console.log("te",data);  // Log to check what data is being returned
        setOwnerID(data);
      }
    };    
    fetchQuanheParam_ownerid();
  }, [params.id]);

  const btnFlower = async () => {
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    const newFriend = {
      owner: params.id,
      idAccount: loggedInUser._id,
      status: 'đang theo dõi'
    };

    const res = await fetch(`http://localhost:4000/friendShip/add`, {
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newFriend),
      method: 'POST'
    });

    if (res.ok) {
      const newFr = {
        owner: loggedInUser._id,
        idAccount: params.id,
        status: 'theo dõi'
      };
      const ress = await fetch(`http://localhost:4000/friendShip/add`, {
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newFr),
        method: 'POST'
      });
      if (ress.ok) {
        alert('Theo dõi thành công');
      const newNoTi = {
        idAccount:params.id,
        owner:loggedInUser._id,
        content:"Đã bắt đầu theo dõi bạn"
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
  // Hàm xác nhận yêu cầu kết bạn
  const btnxacnhan = async (id: string) => {
    try {
      const editStatus = { status: 'accepted' };
      const res = await fetch(`http://localhost:4000/friendShip/xacnhan/${id}`, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editStatus),
        method: 'PUT',
      });
      if (res.ok) {
        alert('Bạn đã chấp nhận yêu cầu kết bạn!')
        const newNoTi = {
          idAccount:params.id,
          owner:loggedInUser._id,
          content:"Đã chấp nhận yêu cầu của bạn, giờ hai bạn đã là bạn bè"
        }
        const resNoti = await fetch(`http://localhost:4000/notification/addPost`,{
          headers:{
            'content-type':'application/json'
  
          },
          method:'POST',
          body:JSON.stringify(newNoTi)
        })
      }
    } catch (error) {
      console.error('Lỗi:', error);
      alert('Đã xảy ra lỗi khi cập nhật!');
    }
  };
  const signOut = () => {
    localStorage.removeItem('user');
    alert('Bạn đã đăng xuất thành công!');
    location.href = '/user/login';
  };

  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');

  const handleDeleteFriend = async (id: string) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn hủy bạn bè này không?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:4000/friendShip/deleteFriend/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Đã xóa bạn bè thành công!');
      } else {
        alert('Lỗi khi xóa bạn bè!');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      alert('Đã xảy ra lỗi khi xóa!');
    }
  };

  function showNguoiTheoDoi() {
    let nguoitheodoi = document.getElementById('containernguoitheodoi') as HTMLElement;
    if (nguoitheodoi) {
      nguoitheodoi.style.display = 'block';
    }
  }

  function showDangTheoDoi() {
    let dangtheodoi = document.getElementById('containerdangtheodoi') as HTMLElement;
    if (dangtheodoi) {
      dangtheodoi.style.display = 'block';
    }
  }

  function hienPosts() {
    let post = document.getElementById('containerPosts') as HTMLElement;
    let reel = document.getElementById('containerReels') as HTMLElement;
    if (post && reel) {
      post.style.display = 'block';
      reel.style.display = 'none';
    }
  }

  function hienReels() {
    let post = document.getElementById('containerPosts') as HTMLElement;
    let reel = document.getElementById('containerReels') as HTMLElement;
    if (post && reel) {
      post.style.display = 'none';
      reel.style.display = 'block';
    }
  }

  return (
    <>
      <Nav />
      <main>
        <div className="profile-header">
          <div className="profile-pic">
            {user && (
              <img src={`/img/${user.avata}`} alt="" />
            )}
          </div>
          <div className="profile-info">
            <div className="profile-username">
              {user && (
                <h5>{user.lastName} {user.firstName}</h5>
              )}
              {loggedInUser._id === params.id && (
                <div>
                  <button className="button">
                    <Link href={`/user/editProfilePage/${user?._id}`}>Chỉnh sửa</Link>
                  </button>
                  <button className="button">
                    <a href="#" onClick={signOut}>Đăng Xuất</a>
                  </button>
                </div>
              )}
            </div>
            <div className="profile-stats">
              {
                (!friendParams || 
                  (friendParams.status !== 'accepted' && friendParams.status !== 'đang theo dõi'&& friendParams.status !== 'theo dõi')) &&
                loggedInUser._id !== params.id && (
                  <span onClick={btnFlower} className="d-block">
                    <label>Theo dõi</label>
                  </span>
                )
              }

              {
                friendParams && (
                  friendParams.status === 'accepted' ? (
                    <span className="d-block" onClick={() => handleDeleteFriend(friendParams._id)}>
                      <label>Bạn bè</label>
                    </span>
                  ) : (
                    <></>
                  ) 
                )
              }
              {
                idowner && (
                  idowner.status === 'đang theo dõi' ? (
                    <span className="d-block" onClick={()=>btnxacnhan(idowner._id)}>
                      <label>Chấp nhận</label>
                    </span>
                  ) : (
                    <></>
                  ) 
                )
              }
              {
                ownerID && (
                  ownerID.status === 'theo dõi' ? (
                    <span className="d-block" onClick={()=>handleDeleteFriend(idowner._id)}>
                      <label>Hủy theo dõi</label>
                    </span>
                  ) : (
                    <></>
                  ) 
                )
              }
              <a onClick={showNguoiTheoDoi}><label>Người theo dõi</label></a>
              <a onClick={showDangTheoDoi}><label>Đang theo dõi</label></a>
            </div>
          </div>
        </div>

        <div className="tabs">
          <div className="tab">
            <i className="fa-solid fa-grid p-1" onClick={hienPosts}>Posts</i>
          </div>
          <div className="tab">
            <i className="fa-solid fa-grid p-1" onClick={hienReels}>Reels</i>
          </div>
        </div>
        <PostIndividual params={params} />
        <ReelIndividual params={params} />
        <Flower params={params} />
        <DangTheoDoi params={params} />
      </main>
    </>
  );
}
