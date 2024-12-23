import "../navbar/nav.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import Search from "../search/page";

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avata: string;
  role: string; // Thêm thuộc tính role để phân biệt quyền
}

export default function Nav() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  function ClickSearch() {
    const navconhien = document.getElementById("ulnavcon") as HTMLElement;
    if (navconhien.style.display === "block") {
      navconhien.style.display = "none";
    } else {
      navconhien.style.display = "block";
    }
  }

  return (
    <>
      <nav>
        <i className="iconlogo">R</i>
        <h2>Renet</h2>
        <div className="container_ul">
          <ul>
            <li>
              <Link href="/user/homePage">
                <i className="bi bi-house-door"></i>
                <span>Trang chủ</span>
              </Link>
            </li>
            <li>
              <a href="#" id="searchButton" onClick={ClickSearch}>
                <i className="bi bi-search"></i>
                <span>Tìm kiếm</span>
              </a>
              <Search />
            </li>
            <li className="tinnhan">
              <Link href="/user/mesagePage">
                <i className="bi bi-chat-dots"></i>
                <span>Nhắn tin</span>
              </Link>
            </li>
            <li>
              <Link href="/user/reelPage">
                <i className="bi bi-camera-video"></i>
                <span>Reels</span>
              </Link>
            </li>
            <li>
              <Link href="/user/postORreel">
                <i className="bi bi-plus-circle"></i>
                <span>Đăng bài</span>
              </Link>
            </li>
            <li>
              <Link href="/user/notificationPage">
                <i className="bi bi-bell"></i>
                <span>Thông báo</span>
              </Link>
            </li>
            {user && (
              <li>
                <Link href={`/user/profilePage/${user._id}`}>
                  <i className="bi bi-person"></i>
                  <span>Hồ sơ</span>
                </Link>
              </li>
            )}
            {/* Kiểm tra nếu tài khoản là admin thì hiển thị mục Quản lí */}
            {user?.role === "admin" && (
              <li className="menu-admin">
                <i className="bi bi-list"></i> 
                <span id='span'>Quản lí</span>
                <ul className="sub-menu">
                  <li>
                    <Link href="/admin/managerPost">
                      <i className="bi bi-list"></i>
                      <span>Quản lí bài viết</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/managerReel">
                      <i className="bi bi-list"></i>
                      <span>Quản lí Reel</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/accounts">
                      <i className="bi bi-people"></i>
                      <span>Quản lí tài khoản</span>
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
}
