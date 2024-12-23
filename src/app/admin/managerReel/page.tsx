'use client';
import Nav from "@/app/user/navbar/page";
import './css.css';
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Report {
  _id: string;
  content: string;
  dateReport: string;
  statusReport: string;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    avata: string;
  };
  idReel: {
    _id: string;
    video: string;
    title: string;
    content: string;
    dateReel: string;
  };
}

export default function ManagerReel() {
  const [reports, setReports] = useState<Report[]>([]);

  // Kiểm tra quyền truy cập
  useEffect(() => {
    const checkAccess = async () => {
      const storedUser = localStorage.getItem("user");
      console.log("Stored user:", storedUser);
      
      if (!storedUser) {
        alert("Bạn cần đăng nhập để truy cập!");
        location.href ='/user/login'
        return;
      }
      
      const currentUser = JSON.parse(storedUser);
      console.log("Current user:", currentUser);
      
      try {
        const res = await fetch(`http://localhost:4000/account/accountByID/${currentUser._id}`);
        const data = await res.json();
        console.log("API response:", data);
        
        if (!data.role || data.role !== "admin") {
          alert("Bạn không có quyền truy cập trang này!");
          location.href='/user/homePage'
        }
      } catch (error) {
        console.error("Lỗi kiểm tra quyền truy cập:", error);
        location.href = '/user/homePage'
      }
    };

    checkAccess();
  }, []);

  // Lấy danh sách báo cáo Reel
  const fetchReports = async () => {
    const res = await fetch(`http://localhost:4000/report/reportReel/all`);
    const data = await res.json();
    setReports(data);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Xử lý xác nhận báo cáo reel
  const editStatus = async (e: React.FormEvent, id: string, idReport: string) => {
    e.preventDefault();
    try {
      // Cập nhật trạng thái báo cáo
      const reportRes = await fetch(`http://localhost:4000/report/reportReel/updateStatus/${idReport}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ statusReport: "Đã xác nhận" })
      });

      if (reportRes.ok) {
        alert("Bạn đã xác nhận báo cáo");
        // Cập nhật lại danh sách báo cáo để hiển thị trạng thái mới
        fetchReports();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  // Xử lý xóa báo cáo
  const deleteReport = async (e: React.FormEvent, idReel: string, idReport: string) => {
    e.preventDefault();
    const res = await fetch(`http://localhost:4000/report/reportReel/delete/${idReport}`, {
      headers: { "content-type": "application/json" },
      method: "DELETE",
    });

    if (res.ok) {
alert("Đã xóa báo cáo thành công");
      fetchReports();
    }
  };

  // Xóa Reel và báo cáo liên quan
  const btnDeleteReel = async (id: string, idReport: string) => {
    try {
      // Xóa reel trước
      const reelRes = await fetch(`http://localhost:4000/reel/delete/${id}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
      });

      if (reelRes.ok) {
        // Sau đó xóa báo cáo
        await fetch(`http://localhost:4000/report/reportReel/delete/${idReport}`, {
          method: "DELETE",
          headers: { "content-type": "application/json" },
        });
        alert("Đã xóa reel và báo cáo thành công");
        fetchReports();
      }
    } catch (error) {
      console.error("Lỗi khi xóa reel:", error);
      alert("Có lỗi xảy ra khi xóa reel");
    }
  };

  return (
    <>
      <Nav />
      <div className="containerPost">
        <div className="conPost">
          <h4>Quản lý Báo cáo Reel</h4>
          <table>
            <thead>
              <tr>
                <th>Video</th>
                <th>Nội dung báo cáo</th>
                <th>Ngày báo cáo</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report: Report) => (
                <tr key={report._id} className="trAccount">
                  <td>
                    {report.idReel && (
                      <Link href={`/user/detailReel/${report.idReel._id}`}>
                        <video width="100" height="100">
                          <source src={report.idReel.video} type="video/mp4" />
                        </video>
                      </Link>
                    )}
                  </td>
                  <td>
                    <label>Nội dung báo cáo:</label>
                    <span>{report.content}</span>
                  </td>
                  <td>
                    <label>Ngày báo cáo:</label>
                    <span>{report.dateReport}</span>
                  </td>
                  <td>
                    <label>Trạng thái:</label>
                    <span>{report.statusReport}</span>
                  </td>
                  <td>
                    <button onClick={(e) => deleteReport(e, report.idReel._id, report._id)} 
                            className="btn btn-danger">
                      Hủy
                    </button>
                    <button onClick={(e) => editStatus(e, report.idReel._id, report._id)} 
                            className="btn btn-success">
                      Xác nhận
                    </button>
                    <button onClick={() => btnDeleteReel(report.idReel._id, report._id)} 
                            className="btn btn-warning">
                      Xóa
                    </button>
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