"use client";

import { useState, useEffect } from "react";
import Nav from "../../user/navbar/page";
import "../accounts/quanliaccount.css";

// Định nghĩa kiểu dữ liệu cho tài khoản
interface Account {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    birth: string;
    avata: string;
    role: string | null;
    status: string; // Trạng thái: "active" hoặc "inactive"
}

// Định nghĩa kiểu dữ liệu cho yêu cầu mở khóa
interface UnlockRequest {
    userId: string;
    email: string;
    reason: string;
    imageUrl: string | null;
    requestDate: string;
    status: string; // Trạng thái yêu cầu: "pending", "approved"
}

const AccountManagement = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [unlockRequests, setUnlockRequests] = useState<UnlockRequest[]>([]);
    const [userRole, setUserRole] = useState<string>("user");
    const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
    const [modalImage, setModalImage] = useState<string | null>(null); 
    const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState<boolean>(false); 
    const [editingAccount, setEditingAccount] = useState<Account | null>(null); 

    useEffect(() => {
        fetch("http://localhost:4000/account/allAccount")
            .then((response) => response.json())
            .then((data: Account[]) => {
                setAccounts(data);
            })
            .catch((error) => console.error("Error fetching accounts:", error));
    }, []);

    const fetchUnlockRequests = async () => {
        try {
            const response = await fetch("http://localhost:4000/account/getUnlockRequests");
            if (response.ok) {
                const data = await response.json();
                setUnlockRequests(data.unlockRequests);
                const pendingCount = data.unlockRequests.filter(
                    (request: UnlockRequest) => request.status === "pending"
                ).length;

                setPendingRequestsCount(pendingCount);
                alert("Lấy danh sách yêu cầu mở khóa thành công.");
            } else {
                alert("Không thể lấy danh sách yêu cầu mở khóa.");
            }
        } catch (error) {
            console.error("Error fetching unlock requests:", error);
            alert("Đã xảy ra lỗi khi lấy danh sách yêu cầu.");
        }
    };

    const handleBlockAccount = async (id: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === "active" ? "inactive" : "active"; // Đổi trạng thái
            const response = await fetch(
                `http://localhost:4000/account/updateStatus/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ status: newStatus })
                }
            );

            if (response.ok) {
                setAccounts(accounts.map(
                    (account) => account._id === id
                        ? { ...account, status: newStatus }
                        : account
                ));
                alert(`Tài khoản đã được ${newStatus === "active" ? "mở khóa" : "chặn"} thành công.`);
            } else {
                alert("Không thể cập nhật trạng thái tài khoản.");
            }
        } catch (error) {
            console.error("Error updating account status:", error);
            alert("Đã xảy ra lỗi khi cập nhật trạng thái tài khoản.");
        }
    };

    const handleApproveRequest = async (userId: string, requestId: string) => {
        try {
            const responseRequest = await fetch(
                `http://localhost:4000/account/acceptUnlockRequest/${userId}/${requestId}`,
                { method: "PUT" }
            );

            if (responseRequest.ok) {
                setUnlockRequests(unlockRequests.map(
                    (request) => request.userId === userId
                        ? { ...request, status: "approved" }
                        : request
                ));
                const responseAccount = await fetch(
                    `http://localhost:4000/account/updateStatus/${userId}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "active" }),
                    }
                );

                if (responseAccount.ok) {
                    setAccounts(accounts.map(
                        (account) => account._id === userId
                            ? { ...account, status: "active" }
                            : account
                    ));
                    alert("Yêu cầu mở khóa đã được phê duyệt và tài khoản đã được mở khóa.");

                    // Giảm số lượng yêu cầu chờ duyệt
                    setPendingRequestsCount((prevCount) => prevCount - 1);
                } else {
                    alert("Không thể cập nhật trạng thái tài khoản.");
                }
            } else {
                alert("Không thể phê duyệt yêu cầu.");
            }
        } catch (error) {
            console.error("Error approving unlock request:", error);
            alert("Đã xảy ra lỗi khi phê duyệt yêu cầu.");
        }
    };

    // Open modal with the image URL
    const openImageModal = (imageUrl: string | null) => {
        if (imageUrl) {
            setModalImage(imageUrl);
        }
    };

    // Close the modal
    const closeImageModal = () => {
        setModalImage(null);
    };
// Open the edit role modal
    const openEditRoleModal = (accountId: string, currentRole: string) => {
        setEditingAccount(accounts.find(account => account._id === accountId) || null);
        setIsEditRoleModalOpen(true);
    };

    // Handle role update
    const handleUpdateRole = async (newRole: string) => {
        if (editingAccount) {
            try {
                const response = await fetch(
                    `http://localhost:4000/account/Role/${editingAccount._id}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ role: newRole }),
                    }
                );

                if (response.ok) {
                    setAccounts(accounts.map(
                        (account) => account._id === editingAccount._id
                            ? { ...account, role: newRole }
                            : account
                    ));
                    alert("Cập nhật quyền thành công.");
                    setIsEditRoleModalOpen(false);
                } else {
                    alert("Không thể cập nhật quyền.");
                }
            } catch (error) {
                console.error("Error updating role:", error);
                alert("Đã xảy ra lỗi khi cập nhật quyền.");
            }
        }
    };

    return (
        <>
            <Nav />
            <div className="containerPost">
                <div className="conPost">
                    {/* Nút lấy danh sách yêu cầu mở khóa */}
                    <button
                        onClick={fetchUnlockRequests}
                        style={{
                            marginBottom: "20px",
                            width: "300px",
                            padding: "10px",
                            backgroundColor: "#454545",
                            color: "#fff",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            position: "relative",
                        }}
                    >
                        Các yêu cầu trợ giúp
                        {/* Bong bóng chat hiển thị số yêu cầu */}
                        {pendingRequestsCount > 0 && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "-10px",
                                    right: "-10px",
                                    backgroundColor: "red",
                                    color: "white",
                                    borderRadius: "50%",
                                    width: "20px",
                                    height: "20px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "12px",
                                }}
                            >
                                {pendingRequestsCount}
                            </div>
                        )}
                    </button>

                    {/* Bảng danh sách tài khoản */}
                    <table>
                        <thead>
                            <tr>
                                <th>Thông tin tài khoản</th>
                                <th>Email</th>
                                <th>Số điện thoại</th>
                                <th>Ngày sinh</th>
                                <th>Quyền</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts
                                .filter(
                                    (account) => userRole === "admin" || account.role !== "admin"
                                )
                                .map((account) => (
                                    <tr key={account._id} className="trAccount">
                                        <td>
                                            <div className="img">
                                                <img
                                                    src={account.avata}
                                                    alt="User avatar"
                                                    style={{
                                                        width: "50px",
                                                        height: "50px",
                                                        objectFit: "cover",
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() => openImageModal(account.avata)} 
                                                />
                                            </div>
                                            <div className="mx-1">
                                                <a href="#" className="d-block text-decoration-none text-black">
                                                    {account.firstName} {account.lastName}
                                                </a>
                                                <span>ID: {account._id}</span>
                                            </div>
                                        </td>
                                        <td>{account.email}</td>
                                        <td>{account.phoneNumber}</td>
                                        <td>{account.birth}</td>
                                        <td>{account.role || "user"}
                                             <a
                                                onClick={() => openEditRoleModal(account._id, account.role!)}
                                                style={{  
                                                    padding: "5px 10px",
                                                    color: "blue",
                                                    border: "none",
                                                    borderRadius: "5px",
                                                    cursor: "pointer",
                                                }}
                                            >sửa</a>
                                        </td>
                                        <td>
                                            <div className={`status ${account.status === "active" ? "active" : "inactive"}`}>
                                                {account.status === "active" ? (
                                                    <span className="text-success">Active</span>
                                                ) : (
                                                    <span className="text-danger">Inactive</span>
                                                )}
                                            </div>
                                            {/* Nút Block hoặc Unblock */}
                                            <button
                                                onClick={() => handleBlockAccount(account._id, account.status)}
                                                style={{
                                                    marginTop: "8px",
                                                    padding: "5px 10px",
                                                    backgroundColor: account.status === "active" ? "red" : "green",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "5px",
                                                }}
                                            >
                                                {account.status === "active" ? "Block" : "Unblock"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>

                    {/* Danh sách yêu cầu mở khóa */}
                    {unlockRequests.length > 0 && (
                        <div>
                            <h3>Danh sách yêu cầu mở khóa</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>Lý do</th>
                                        <th>Ngày gửi</th>
                                        <th>Ảnh chứng</th>
                                        <th>Trạng thái</th>
                                        <th>Phê duyệt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {unlockRequests.map((request) => (
                                        <tr key={request.userId}>
                                            <td>{request.email}</td>
                                            <td>{request.reason}</td>
                                            <td>{request.requestDate}</td>
                                            <td>
                                                {request.imageUrl && (
                                                    <img
                                                        src={request.imageUrl}
                                                        alt="Evidence"
                                                        style={{
                                                            width: "50px",
                                                            height: "50px",
                                                            objectFit: "cover",
                                                            cursor: "pointer",
                                                        }}
                                                        onClick={() => openImageModal(request.imageUrl)} // Open modal on image click
                                                    />
                                                )}
                                            </td>
                                            <td>{request.status === "pending" ? "Chờ duyệt" : "Đã phê duyệt"}</td>
                                            <td>
                                                {request.status === "pending" && (
                                                    <button
                                                        onClick={() => handleApproveRequest(request.userId, request.userId)}
                                                        style={{
                                                            padding: "5px 10px",
                                                            backgroundColor: "green",
                                                            color: "white",
                                                            border: "none",
                                                            borderRadius: "5px",
                                                        }}
                                                    >
                                                        Phê duyệt
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Modal hiển thị ảnh lớn */}
                    {modalImage && (
                        <div className="modal" onClick={closeImageModal}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <img src={modalImage} alt="Large view" style={{ width: "100%", height: "auto" }} />
                                <span className="close" onClick={closeImageModal}>×</span>
                            </div>
                        </div>
                    )}
                     {/* Modal chỉnh sửa quyền */}
                    {isEditRoleModalOpen && editingAccount && (
                        <div className="modal">
                            <div className="modal-content">
                                <h3>Chỉnh sửa quyền cho {editingAccount.firstName} {editingAccount.lastName}</h3>
                                <select
                                    value={editingAccount.role || "user"}
                                    onChange={(e) => handleUpdateRole(e.target.value)}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <button
                                    onClick={() => setIsEditRoleModalOpen(false)}
                                    style={{
                                        backgroundColor: "gray",
                                        padding: "5px 10px",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "5px",
                                    }}
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AccountManagement; 

