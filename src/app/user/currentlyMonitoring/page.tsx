import React, { useEffect, useState } from 'react';
import "../currentlyMonitoring/current.css"
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
export default function DangTheoDoi({params}:{params:{id:string}}) {
  const [followers, setFollowers] = useState<any[]>([]); // Đảm bảo khởi tạo là mảng
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  // Đóng danh sách người theo dõi
  const closeNguoiTheoDoi = (): void => {
    setIsVisible(false);
  };
  useEffect(() => {
    const showData = localStorage.getItem('user');
    if (showData) {
      setUser(JSON.parse(showData));
    }
  }, []);

  useEffect(() => {
    const fetchID = async () => {
        const res = await fetch(`http://localhost:4000/friendShip/duoctheodoi/${params.id}`);
        const data = await res.json();
          setFollowers(data);
    };
    fetchID();
  }, []);
  // Nếu danh sách người theo dõi bị ẩn thì không render component
  if (!isVisible) return null;
  const handleDeleteFriend = async (id: string) => {
    try {
        const res = await fetch(`http://localhost:4000/friendShip/deleteFriend/${id}`, {
            method: 'DELETE',
        });
  
        if (res.ok) {
          const updatedFollowers = await fetch(
            `http://localhost:4000/friendShip/nguoitheodoi/${params.id}`
        );
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
  return (
    <div id="containerdangtheodoi">
      <div className="childnguoitheodoi">
        <div className="header_content">
          <h5>Đang theo dõi</h5>
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
          {
            followers.length > 0 ? (
              followers.map((fl: any) => (
                <div className="item" key={fl._id}>
                  <div className="account">
                   <Link href={`/user/profilePage/${fl.idAccount}`}> 
                   <ShowAccount params={{id: fl.idAccount}} />
                   <a className='mx-2'><ShowName params={{ id: fl.idAccount }} /></a></Link>
                  </div>
                  <div>
                    {
                      user?._id === params.id && (
                    <button onClick={() => handleDeleteFriend(fl._id)}>
                      Bỏ theo dõi
                    </button>
                      )
                    }
                    
                  </div>
                </div>
              ))
            ) : (
              <p>Không có người theo dõi</p>
            )
          }
        </div>
      </div>
    </div>
  );
}
