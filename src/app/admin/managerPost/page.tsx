'use client'
import Nav from "@/app/user/navbar/page"
import '../managerPost/css.css'
import React, { useEffect, useState } from "react";
import ShowAccount from "@/app/user/componentAccount/image";
import ShowName from "@/app/user/componentAccount/name";
import Link from "next/link";

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avata:string
}
export default function ManagerPost() {
    const [reports,setReports] = useState<any>([])
    const [user,setUser] = useState<User|null>(null)
      // local tài khoản
      useEffect(()=>{
        const showData = localStorage.getItem('user')
        if(showData){
          setUser(JSON.parse(showData))
        }
      },[])
    const fetchReport = async ()=>{
      const res = await fetch(`http://localhost:4000/report/all`)
      const data = await res.json()
      setReports(data)
  }

  useEffect(()=>{
    fetchReport()
  },[])
  const editStatus = async (e:React.FormEvent,id:string,idReport:string)=>{
    e.preventDefault()
    const newData = {
        statusPost :"off"
    }
    const res = await fetch(`http://localhost:4000/post/editStatus/${id}`,{
        headers:{
            'content-type':'application/json'
        },
        body:JSON.stringify(newData),
        method:'PUT'
    })
    if(res.ok){
        alert('Bạn đã xác nhận báo cáo')
        const newstatus = {
          statusReport:'Đã xác nhận'
        }
        const resReport = await fetch(`http://localhost:4000/report/editStatus/${idReport}`,{
          headers:{
              'content-type':'application/json'
          },
          body:JSON.stringify(newstatus),
          method:'PUT'
      })
      if(resReport.ok){
        fetchReport()
        // 
      const resPostDetail = await fetch(`http://localhost:4000/post/postByID/${id}`)
      const dataPost = await resPostDetail.json()
      const newNoTi = {
        type:'report',
        idAccount:dataPost.idAccount,
        content:"Có một bài viết của bạn có dấu hiệu phản cảm",
        owner:user?._id,
        idReport:idReport
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
  const deleteReport = async (e:React.FormEvent,idPost:string,id:string)=>{
    e.preventDefault()
    const newData = {
        statusPost :"on"
    }
    const res = await fetch(`http://localhost:4000/post/editStatus/${idPost}`,{
        headers:{
            'content-type':'application/json'
        },
        body:JSON.stringify(newData),
        method:'PUT'
    })
    if(res.ok){
      const resdelete = await fetch(`http://localhost:4000/report/delete/${id}`,{
        headers:{
          'content-type':'application/json'
        },
        method:'DELETE'
      })
      if(resdelete.ok){
        alert('xóa thành công')
      }
    }
    fetchReport()
  }
  const btnDeletePost = async(id:string,idre:string) =>{
    const res =await fetch(`http://localhost:4000/post/delete/${id}`,{
      method:"DELETE",
      headers:{
        'content-type':'application/json'
      }
    })
    if(res.ok){
      const resdelete = await fetch(`http://localhost:4000/report/delete/${idre}`,{
        headers:{
          'content-type':'application/json'
        },
        method:'DELETE'
      })
      fetchReport()
    }
  }
  return (
    <>
      <Nav />
      <div className="containerPost">
        <div className="conPost">
          <table>
            <thead>
              <tr>
                <th>Thông tin tài khoản</th>
                <th>Nội dung báo cáo</th>
                <th>Ngày báo cáo</th>
                <th>Phản hồi báo cáo</th>
                <th>Trạng thái báo cáo</th>
                <th>khác</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report:any) => (
                <tr key={report._id} className="trAccount">
                <Link href={`/user/detailPost/${report.idPost}`}>
                <td>
                  <div className="img">
                    <ShowAccount params={{id:report.owner}} />
                  </div>
                  <div className="mx-1">
                    <div className="d-block text-decoration-none text-black">
                      <ShowName params={{id:report.owner}} />
                    </div>
                  </div>
                </td>
                </Link>
                  <td>
                    <span>{report.content}</span>
                  </td>
                  <td>
                    <span>{report.dateReport}</span>
                  </td>
                  <td>
                    <span>{report.request}</span>
                  </td>
                  <td>
                    <span>{report.statusReport}</span>
                  </td>
                  <td>
                    <button onClick={(e)=>deleteReport(e,report.idPost,report._id)}>Hủy</button>
                    <button onClick={(e)=>editStatus(e,report.idPost,report._id)}>Xác nhận</button>
                    {
                      report.statusReport === 'Đã xác nhận' &&(
                        <button onClick={()=>{btnDeletePost(report.idPost,report._id)}}>Xóa</button>
                      )
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
