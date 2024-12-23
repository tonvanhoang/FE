import React, { useEffect, useState } from 'react';
import '../follower/flower.css';
import ShowAccount from '../componentAccount/image';
import ShowName from '../componentAccount/name';
import Link from 'next/link';
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avata: string;
}

export default function Flower({ params }: { params: { id: string } }) {
  const [followers, setFollowers] = useState<any[]>([]); // Danh sách người theo dõi
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const showData = localStorage.getItem('user');
    if (showData) {
      setUser(JSON.parse(showData));
    }
  }, []);

  // Đóng danh sách người theo dõi
  const closeNguoiTheoDoi = (): void => {
    setIsVisible(false);
  };

  useEffect(() => {
    const fetchID = async () => {
      const res = await fetch(`http://localhost:4000/friendShip/nguoitheodoi/${params.id}`);
      const data = await res.json();
      setFollowers(data);
    };
    fetchID();
  }, [params.id]);

  // Hàm xác nhận yêu cầu kết bạn
  const btnxacnhan = async (id: string,idacc:string,idowner:string) => {
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      const editStatus = { status: 'accepted' };
      const res = await fetch(`http://localhost:4000/friendShip/xacnhan/${id}`, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editStatus),
        method: 'PUT',
      });
      if (res.ok) {
        const updatedFollowers = await fetch(`http://localhost:4000/friendShip/nguoitheodoi/${params.id}`);
        const followersData = await updatedFollowers.json();
        setFollowers(followersData);
        const newNoTi = {
          idAccount:idacc,
          owner:idowner ,
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

  // Hàm hủy yêu cầu kết bạn
  const handleDeleteFriend = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:4000/friendShip/deleteFriend/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const updatedFollowers = await fetch(`http://localhost:4000/friendShip/nguoitheodoi/${params.id}`);
        const followersData = await updatedFollowers.json();
        setFollowers(followersData);
      } else {
        alert('Lỗi khi xóa!');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      alert('Đã xảy ra lỗi khi xóa!');
    }
  };
  // Nếu danh sách người theo dõi bị ẩn thì không render component
  if (!isVisible) return null;
  return (
    <div id="containernguoitheodoi">
      <div className="childnguoitheodoi">
        <div className="header_content">
          <h5>Người theo dõi</h5>
          <i className="bi bi-x-lg" onClick={closeNguoiTheoDoi}></i>
        </div>
        <hr />
        <input
          type="text"
          placeholder="Tìm kiếm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="content">
          {followers.length > 0 ? (
            followers.map((fl: any) => (
              <div className="item" key={fl._id}>
                <div className="account">
                <div className="account">
                   <Link href={`/user/profilePage/${fl.idAccount}`}> 
                   <ShowAccount params={{id: fl.idAccount}} />
                   <a className='mx-2'><ShowName params={{ id: fl.idAccount }} /></a></Link>
                  </div>
                </div>
                {user?._id === params.id&& (
                  <div>
                    <button className="mx-2" onClick={() => handleDeleteFriend(fl._id)}>
                      Hủy
                    </button>
                    <button onClick={() => btnxacnhan(fl._id,fl.idAccount,fl.owner)}>
                      Xác nhận
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>Không có người theo dõi</p>
          )}
        </div>
      </div>
    </div>
  );
}
