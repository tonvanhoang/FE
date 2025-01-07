'use client';
import '../../editPassword/[id]/editProfile.css';
import Link from 'next/link';
import React, { useEffect, useState } from "react";

export default function EditName({ params }: { params: { id: string } }) {
  const [account, setAccount] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false); // To toggle password visibility

  // Fetch account data when the component mounts
  useEffect(() => {
    const fetchAccount = async () => {
      const res = await fetch(`http://localhost:4000/account/accountByID/${params.id}`);
      const data = await res.json();
      setAccount(data);
      setPassword(data.password);
      console.log(data);
    };
    fetchAccount();
  }, [params.id]);

  // Handle form submission
  const btnName = async (idacc: string, e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission

    // Check if the password is empty
    if (!password) {
      alert('Vui lòng nhập mật khẩu!');
      return;
    }

    const newdata = {
      password,
    };

    const res = await fetch(`http://localhost:4000/account/editPassword/${idacc}`, {
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

          {/* Form for editing password */}
          <form>
            <h4>Thay đổi mật khẩu tài khoản</h4>
            <hr />

            {/* Input for password */}
            <div className="mb-3 Input">
              <label className="form-label">Nhập mật khẩu mới</label>
              <input
                type={passwordVisible ? 'text' : 'password'} // Toggle between password and text
                className="form-control"
                value={password} // Get value from state
                onChange={(e) => setPassword(e.target.value)} // Update state when user types
                placeholder="Vui lòng nhập mật khẩu"
              />
              <div className="text-danger d-none">Vui lòng nhập mật khẩu</div>
            </div>

            {/* Toggle password visibility */}
            <div className="mb-3">
              <label className="form-check-label">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={passwordVisible}
                  onChange={() => setPasswordVisible(!passwordVisible)} // Toggle visibility
                />
                Hiển thị mật khẩu
              </label>
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
