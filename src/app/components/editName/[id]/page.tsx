'use client';
import '../../editName/[id]/editProfile.css';
import Link from 'next/link';
import React, { useEffect, useState } from "react";

export default function EditName({ params }: { params: { id: string } }) {
  const [account, setAccount] = useState<any>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Fetch account data when the component mounts
  useEffect(() => {
    const fetchAccount = async () => {
      const res = await fetch(`http://localhost:4000/account/accountByID/${params.id}`);
      const data = await res.json();
      setAccount(data);
      setFirstName(data.firstName);
      setLastName(data.lastName);
      console.log(data);
    };
    fetchAccount();
  }, [params.id]);

  // Handle form submission
  const btnName = async (idacc: string, e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission

    // Check if the first name and last name are not empty
    if (!firstName || !lastName) {
      alert('Vui lòng nhập đầy đủ họ và tên!');
      return;
    }

    const newdata = {
      firstName,
      lastName,
    };

    const res = await fetch(`http://localhost:4000/account/editName/${idacc}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify(newdata),
    });

    if (res.ok) {
      alert('Cập nhật thành công');
      location.href = `/user/editProfilePage/${idacc}`;
    } else {
      alert('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  return (
    <>
      {account && (
        <div id="formEditPro">
          {/* Close button */}
          <Link href={`/user/editProfilePage/${account._id}`}>
            <i id="closeCart" className="bi bi-x-lg"></i>
          </Link>

          {/* Form for editing name */}
          <form>
            <h4>Thay đổi họ tên tài khoản</h4>
            <hr />

            {/* Input for first name */}
            <div className="mb-3 Input">
              <label className="form-label">Nhập họ của bạn</label>
              <input
                type="text"
                className="form-control"
                value={firstName} // Get value from state
                onChange={(e) => setFirstName(e.target.value)} // Update state when user types
                placeholder="Vui lòng nhập họ"
              />
              <div className="text-danger d-none">Vui lòng nhập họ</div>
            </div>

            {/* Input for last name */}
            <div className="mb-3 Input">
              <label className="form-label">Nhập tên của bạn</label>
              <input
                type="text"
                className="form-control"
                value={lastName} // Get value from state
                onChange={(e) => setLastName(e.target.value)} // Update state when user types
                placeholder="Vui lòng nhập tên"
              />
              <div className="text-danger d-none">Vui lòng nhập tên</div>
            </div>

            {/* Update button */}
            <div className="mb-3 btncapnhat">
              <button type="submit" onClick={(e) => btnName(account._id, e)}>Cập nhật</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
