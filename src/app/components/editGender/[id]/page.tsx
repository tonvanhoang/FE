'use client';
import '../../editPhone/[id]/editProfile.css';
import Link from 'next/link';
import React, { useEffect, useState } from "react";

export default function EditPhone({ params }: { params: { id: string } }) {
  const [account, setAccount] = useState<any>(null);
  const [gender, setGender] = useState(''); // Use a more descriptive variable name

  // Fetch account data when the component mounts
  useEffect(() => {
    const fetchAccount = async () => {
      const res = await fetch(`http://localhost:4000/account/accountByID/${params.id}`);
      const data = await res.json();
      setAccount(data);
      setGender(data.gender);
      console.log(data);
    };
    fetchAccount();
  }, [params.id]);

  // Handle the form submission when the update button is clicked
  const btnName = async (idacc: string, e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    if (!gender) {
      alert('Vui lòng chọn giới tính!');
      return;
    }

    const newdata = {
      gender: gender,
    };

    const res = await fetch(`http://localhost:4000/account/editGender/${idacc}`, {
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

          {/* Form for editing gender */}
          <form>
            <h4>Thay đổi giới tính</h4>
            <hr />

            {/* Display current gender */}
            <div className="mb-3 Input">
              <label className="form-label">Giới tính hiện tại của bạn là {account.gender}</label>
            </div>

            {/* Gender selection dropdown */}
            <select
              className="form-select form-select-lg mb-3"
              aria-label=".form-select-lg example"
              value={gender} // Bind the value of the select dropdown to state
              onChange={(e) => setGender(e.target.value)} // Update state on change
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>

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
