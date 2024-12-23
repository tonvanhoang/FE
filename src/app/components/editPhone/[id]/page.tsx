'use client';
import '../../editPhone/[id]/editProfile.css';
import Link from 'next/link';
import React, { useEffect, useState } from "react";

export default function EditPhone({ params }: { params: { id: string } }) {
  const [account, setAccount] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState(''); // Rename to setPhoneNumber

  // Fetch account data when the component mounts
  useEffect(() => {
    const fetchAccount = async () => {
      const res = await fetch(`http://localhost:4000/account/accountByID/${params.id}`);
      const data = await res.json();
      setAccount(data);
      setPhoneNumber(data.phoneNumber); // Set the phone number from the account data
      console.log(data);
    };
    fetchAccount();
  }, [params.id]);

  // Handle form submission
  const btnName = async (idacc: string, e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission

    // Check if the phone number is empty
    if (!phoneNumber) {
      alert('Vui lòng nhập số điện thoại!');
      return;
    }

    // Validate phone number format (9 to 11 digits)
    const phoneRegex = /^[0-9]{9,11}$/; // Only allow numbers with 9 to 11 digits
    if (!phoneRegex.test(phoneNumber)) {
      alert('Số điện thoại không hợp lệ. Vui lòng nhập từ 9 đến 11 chữ số!');
      return;
    }

    const newdata = {
      phoneNumber,
    };

    const res = await fetch(`http://localhost:4000/account/editPhone/${idacc}`, {
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

          {/* Form for editing phone number */}
          <form>
            <h4>Thay đổi số điện thoại</h4>
            <hr />

            {/* Input for phone number */}
            <div className="mb-3 Input">
              <label className="form-label">Nhập số điện thoại mới</label>
              <input
                type="text"
                className="form-control"
                value={phoneNumber} // Get value from state
                onChange={(e) => setPhoneNumber(e.target.value)} // Update state when user types
                placeholder="Vui lòng nhập số điện thoại"
              />
              <div className="text-danger d-none">Vui lòng nhập số điện thoại</div>
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
