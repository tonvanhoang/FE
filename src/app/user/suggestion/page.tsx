import { useEffect, useState } from 'react'
import '../suggestion/suggestion.css'
import Link from 'next/link'
export default function Suggestion(){
  const [account,setAccount] = useState<any>([])
  useEffect(()=>{
    const fetchAccount = async ()=>{
      const res = await fetch(`http://localhost:4000/account/allAccount`)
      const data = await res.json()
      setAccount(data)
    }
    fetchAccount()
  },[])
    return(
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
              account.map((acc:any)=>(
                <div className="item1 d-flex justify-content-between">
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
    )
}