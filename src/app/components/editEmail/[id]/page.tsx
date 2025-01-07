'use client';
import '../../editEmail/[id]/editProfile.css';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export default function EditName({ params }: { params: { id: string } }) {
  const [account, setAccount] = useState<any>(null);
  const [email, setEmail] = useState(''); // Change variable name to 'setEmail'

  // Fetch account data when the component mounts
  useEffect(() => {
    const fetchAccount = async () => {
      const res = await fetch(`http://localhost:4000/account/accountByID/${params.id}`);
      const data = await res.json();
      setAccount(data);
      setEmail(data.email);
      console.log(data);
    };
    fetchAccount();
  }, [params.id]);

  // Handle update button click
  const btnName = async (idacc: string, e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form action

    if (!email.trim()) {
      alert('Vui lòng nhập email!');
      return;
    }

    const newdata = {
      email: email,
    };

    const res = await fetch(`http://localhost:4000/account/editEmail/${idacc}`, {
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
          {/* Form to change email */}
          <form>
            <h4>Thay đổi email</h4>
            <hr />
            {/* Input for email */}
            <div className="mb-3 Input">
              <label className="form-label">Nhập email mới</label>
              <input
                type="email" // Use 'email' input type for better validation
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Update state with new email
                placeholder="Vui lòng nhập email"
                required
              />
              <div className="text-danger d-none">Vui lòng nhập email</div>
            </div>
            {/* Update button */}
            <div className="mb-3 btncapnhat">
              <button type="submit" onClick={(e) => btnName(account._id, e)}>
                Cập nhật
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
