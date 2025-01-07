'use client'
import { useEffect, useState } from "react"
import Nav from "../navbar/page"
import '../notificationPage/notification.css'
import Suggestion from "../suggestion/page"
import ShowAccount from "../componentAccount/image"
import ShowName from "../componentAccount/name"
import Link from "next/link"
import io from 'socket.io-client'

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avata: string;
}

export default function Notification() {
  const [user, setUser] = useState<User | null>(null)
  const [noti, setNoti] = useState<any>([])

  useEffect(() => {
    const dataUser = localStorage.getItem('user')
    if (dataUser) {
      const parsedUser: User = JSON.parse(dataUser)
      setUser(parsedUser)
    }
  }, [])

  useEffect(() => {
    const fetchNoti = async () => {
      if (user) {
        const res = await fetch(`http://localhost:4000/notification/notificationByAccount/${user._id}`)
        const data = await res.json()
        setNoti(data)
      }
    }
    fetchNoti()
  }, [user])

  // Thiết lập kết nối Socket.IO
  useEffect(() => {
    const socket = io("http://localhost:4000")

    socket.on('newNotification', (notification) => {
      if (notification.idAccount === user?._id) {
        setNoti((prevNoti:any) => [notification, ...prevNoti]) // Cập nhật danh sách thông báo
      }
    })

    return () => {
      socket.disconnect() // Ngắt kết nối khi component bị unmount
    }
  }, [user])

  // Cập nhật request
  const editRequest = async (id: string) => {
    const edit = {
      request: 'Yêu cầu xem xét lại'
    }
    const res = await fetch(`http://localhost:4000/report/editRequest/${id}`, {
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(edit),
      method: 'PUT'
    })
    if (res.ok) {
      alert('Gửi yêu cầu thành công!')
    }
  }

  return (
    <>
      <Nav />
      <div className="containerNoti">
        <div className="postLeft">
          <div className="item" style={{ marginBottom: "100px" }}>
            <h3>Thông báo</h3>
            <div className="homnay">
              {/* <h6>Hôm nay</h6> */}
              {
                noti.map((no: any) => (
                  <div className="gachaffter" key={no._id}>
                    <div className="thongbaocon">
                      <div className="img">
                        <ShowAccount params={{ id: no.owner }} />
                      </div>
                      <div className="content">
                        <a className="text-decoration-none text-black">
                          <span>
                            <ShowName params={{ id: no.owner }} />
                            {no.content}
                            <i className="mx-1 d-block">{no.dateNotification}</i>
                          </span>
                        </a>
                      </div>
                      {
                        no.type === 'report' && (
                          <div>
                            <button className="btn-yeucau" onClick={() => editRequest(no.idReport)}>Yêu cầu</button>
                          </div>
                        )
                      }
                      {
                        no.type === 'post' && (
                          <div>
                            <Link href={`/user/detailPost/${no.idPost}`}>
                              <button className="btn-yeucau">Xem bài viết</button>
                            </Link>
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
        <Suggestion />
      </div>
    </>
  )
}