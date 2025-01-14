import { useEffect, useState } from 'react'
import '../suggestion/suggestion.css'
import Link from 'next/link'
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avata: string;
}
export default function Suggestion(){
  const [account, setAccount] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const dataUser = localStorage.getItem('user');
    if (dataUser) {
      const parsedUser: User = JSON.parse(dataUser);
      setUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    const fetchAccount = async () => {
      if (user?._id) {
        const res = await fetch(`http://localhost:4000/account/suggestions/${user._id}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setAccount(data);
        } else {
          setAccount([]);
        }
      }
    };
    fetchAccount();
  }, [user]);

  return (
    <>
      <div className="postRight my-5">
        <div className="container_right">
          {/* <!-- title --> */}
          <div className="title d-flex justify-content-between">
            <span>Gợi ý cho bạn</span>
            <a href="#" className='d-none'>Xem tất cả</a>
          </div>
          <div className="imgtaikhoan">
            {
              account.map((acc: any) => (
                <div className="item1 d-flex justify-content-between" key={acc._id}>
                  <Link className='text-decoration-none' href={`/user/profilePage/${acc._id}`}>
                    <div className="d-flex">
                      <div className="img">
                        <img src={`/img/${acc.avata}`} alt="" />
                      </div>
                      <div className="tentaikhoan">
                        <a href="#" className="d-block">{acc.firstName} {acc.lastName}</a>
                        <span>Gợi nhớ cho bạn</span>
                      </div>
                    </div>
                  </Link>
                  <div className="theodoi">
                    <a href="#" className='d-none'>Theo dõi</a>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </>
  );
}