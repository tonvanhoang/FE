'use client'
import { useEffect, useState } from "react"
import Nav from "../navbar/page"
import '../notificationPage/notification.css'
import Suggestion from "../suggestion/page"
import ShowAccount from "../componentAccount/image"
import ShowName from "../componentAccount/name"
import Link from "next/link"
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avata: string;
}
export default function Notification(){
  const [user,setUser] = useState<User|null>(null)
  const [noti,setNoti] = useState<any>([])
  useEffect(()=>{
    
  })
  useEffect(()=>{
    const fetchNoti = async ()=>{
      const dataUser = localStorage.getItem('user')
    if(dataUser){
      const dt = JSON.parse(dataUser)
      const res = await fetch(`http://localhost:4000/notification/notificationByAccount/${dt._id}`)
      const data = await res.json()
      setNoti(data)
    }
    }
    fetchNoti()
  },[])
  // cập nhật request
  const editRequest = async (id:string) =>{
    const edit = {
      request :'Yêu cầu xem xét lại'
    }
    const res = await fetch(`http://localhost:4000/report/editRequest/${id}`,{
      headers:{
        'content-type':'application/json'
      },
      body:JSON.stringify(edit),
      method:'PUT'
    })
    if(res.ok){
      alert('Gửi yêu cầu thành công!')
    }
  }
    return(
        <>
        <Nav/>
        <div className="containerNoti">
        <div className="postLeft">
          <div className="item" style={{ marginBottom: "100px" }}>
            <h3>Thông báo</h3>
            <div className="homnay">
              {/* <h6>Hôm nay</h6> */}
              {
                noti.map((no:any)=>(
                  <div className="gachaffter">
                <div className="thongbaocon">
                  <div className="img" >
                    <ShowAccount params={{id:no.owner}} />
                  </div>
                  <div className="content">
                    <Link className="text-decoration-none text-black" href={`/user/detailPost/${no.idPost}`}> 
                    <span>
                    <ShowName params={{id:no.owner}} />
                    {no.content}
                     <i className="mx-1 d-block">{no.dateNotification}</i>
                    </span>
                    </Link>
                   
                  </div>
                  {
                    no.type == 'report' &&(
                      <div>
                        <button className="btn-yeucau" onClick={()=>editRequest(no.idReport)}>Yêu cầu</button>
                      </div>
                    )
                  }
                </div>
              
              </div>
                  
                ))
              }
           
            </div>
          </div>
        </div>
        {/* <!-- gợi ý --> */}
          <Suggestion/>
      </div>
        </>
    )
}