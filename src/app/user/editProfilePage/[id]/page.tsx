'use client'
import Nav from '../../navbar/page'
import "../../editProfilePage/edit.css"
import Link from 'next/link'
import { useEffect, useState } from 'react'
export default function EditProfile({params}:{params:{id:string}}){
  const [account,setAccount] = useState<any>(null)
  useEffect(()=>{
    const fetchAccount = async ()=>{
      const res = await fetch(`http://localhost:4000/account/accountByID/${params.id}`)
      const data = await res.json()
      setAccount(data)
      console.log(data);
      
    }
    fetchAccount()
  },[params.id])
    return(
        <>
        <Nav/>
        {
          account && (
            <div className="edit-profile">
        <h3>Hồ sơ</h3>
        <div className="profile-form">
          <div className="profile-picture">
            <div className="img">
              <img src={`/img/${account.avata}`} alt="Profile Picture" />
              <div className="addAvatar">
                <Link href={`/components/editAvata/${account._id}`}><i className="bi bi-pencil-square"></i></Link>
              </div>
            </div>
            <div>
              <a href="#">{account.firstName} {account.lastName}</a>
              <p>{account.email}</p>
            </div>
          </div>
          <div className="form-columns">
            <div className="profile-form-column">
              <div className="form-group">
                <label >Tên tài khoản</label>
                <div className="content">
                  <p>{account.firstName} {account.lastName}</p>
                 <Link href={`/components/editName/${account._id}`}><i className="bi bi-pencil-square" ></i></Link>
                </div>
              </div>
              <div className="form-group">
                <label >Bio</label>
                <div className="content">
                  <p>hello mọi người</p>
                 <i className="bi bi-pencil-square"></i>
                </div>
              </div>
              <div className="form-group">
                <label >Ngày sinh</label>
                <div className="content">
                  <p>{account.birth}</p>
                 <Link href={`/components/editBirtday/${account._id}`}><i className="bi bi-pencil-square"></i></Link>
                </div>             
               </div>
              <div className="form-group">
                <label >Giới tính</label>
                <div className="content">
                  <p>{account.gender}</p>
                 <Link href={`/components/editGender/${account._id}`}><i className="bi bi-pencil-square"></i></Link>
                </div>
              </div>
              <div className="form-group">
                <label >Bắt đầu chơi từ ngày</label>
                <div className="content">
                  <p>{account.date}</p>
                </div>
              </div>
            </div>
            <div className="profile-form-column">
              <div className="form-group">
                <label >Mật khẩu</label>
                <div className="content">
                  <p>
                    {account.password}
                  </p>
                 <Link href={`/components/editPassword/${account._id}`}> <i className="bi bi-pencil-square"></i></Link>
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <div className="content">
                  <p>{account.email}</p>
                  <Link href={`/components/editEmail/${account._id}`}><i className="bi bi-pencil-square"></i></Link>
                </div>
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <div className="content">
                  <p>{account.phoneNumber}</p>
                 <Link href={`/components/editPhone/${account._id}`}> <i className="bi bi-pencil-square"></i></Link>
                </div>
              </div>
              {/* <div className="form-group btn">
                <button className="btndelete">Xóa tài khoản</button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
          )
        }
        </>
    )
}