import React, { useEffect, useState } from 'react';
import '../friend/friend.css';
import Link from 'next/link';
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avata: string;
}
export default function Friend(){
  const [Accounts, setAccount] = useState<any>([])
  useEffect(() => {
    const containerFriend = document.querySelector('.containerFriend') as HTMLElement;
    const nextFriendBtn = document.querySelector('.nextFriendBtn') as HTMLAnchorElement;
    const prevFriendBtn = document.querySelector('.prevFriendBtn') as HTMLAnchorElement;
    const scrollAmount = 180; // Độ dài di chuyển (có thể điều chỉnh)
    if (nextFriendBtn) {
      nextFriendBtn.addEventListener('click', () => {
        containerFriend.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    }
    if (prevFriendBtn) {
      prevFriendBtn.addEventListener('click', () => {
        containerFriend.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
    }
    return () => {
      if (nextFriendBtn) {
        nextFriendBtn.removeEventListener('click', () => {
          containerFriend.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
      }
      if (prevFriendBtn) {
        prevFriendBtn.removeEventListener('click', () => {
          containerFriend.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
      }
    };
  }, []);
  useEffect(() => {
    const FetchFriend = async () => {
      const dataUser = localStorage.getItem('user');
      if (dataUser) {
        const parsedUser: User = JSON.parse(dataUser);
        const Res = await fetch(`http://localhost:4000/account/friendsAccount/${parsedUser._id}`);
        const data = await Res.json();
        setAccount(data);
      }
    };
    FetchFriend();
  }, []);
  return (
    <>
      <div className="d-flex align-items-center justify-content-center" id="theChaFriend">
        <a className="prevFriendBtn bi bi-caret-left" id="btn"></a>
        <div className="containerFriend">
          {
            Accounts.map((acc:any)=> (
              <div className="itemFriend" key={acc._id}>
            <Link href={`/user/profilePage/${acc._id}`}>
            <div className="img">
              <img src={`../img/${acc.avata}`} alt="" />
              <div className="trangthai"></div>
            </div>
            </Link>
            <a href="#">{acc.lastName}</a>
          </div>
            ))
          }
        </div>
        <a className="nextFriendBtn bi bi-caret-right" id="btn"></a>
      </div>
    </>
  );
};
