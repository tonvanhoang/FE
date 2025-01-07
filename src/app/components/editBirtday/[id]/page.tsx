'use client'
import '../../editBirtday/[id]/birthday.css'
import Link from 'next/link'
import React, { useEffect, useState } from "react"

export default function EditBirthday({ params }: { params: { id: string } }) {
  const [account, setAccount] = useState<any>(null)
  const [birth, setBirthday] = useState('') // Changed to setBirthday

  useEffect(() => {
    const fetchAccount = async () => {
      const res = await fetch(`http://localhost:4000/account/accountByID/${params.id}`)
      const data = await res.json()
      setAccount(data)
      setBirthday(data.birth) // Set initial birth date
      console.log(data)
    }
    fetchAccount()
  }, [params.id])

  // Handle the form submission
  const btnName = async (idacc: string, e: React.FormEvent) => {
    e.preventDefault() // Prevent default form submission

    // Check if the birth date is empty
    if (!birth) {
      alert('Vui lòng nhập ngày sinh!');
      return;
    }

    const newdata = { birth }

    const res = await fetch(`http://localhost:4000/account/editBirthday/${idacc}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT',
      body: JSON.stringify(newdata)
    })

    if (res.ok) {
      alert('Cập nhật thành công')
      location.href = `/user/editProfilePage/${idacc}`
    } else {
      alert('Có lỗi xảy ra, vui lòng thử lại')
    }
  }

  return (
    <>
      {
        account && (
          <div id="formEditPro">
            {/* Close button */}
            <Link href={`/user/editProfilePage/${account._id}`}>
              <i id="closeCart" className="bi bi-x-lg"></i>
            </Link>
            {/* Form for editing birth date */}
            <form>
              <h4>Thay đổi Ngày sinh</h4>
              <hr />

              {/* Display current birth date */}
              <div className="mb-3 Input">
                <label className="form-label">Ngày sinh hiện tại của bạn: {account.birth}</label>
                <input
                  type="date" // Use date input type
                  className="form-control"
                  value={birth} // Bind to state
                  onChange={(e) => setBirthday(e.target.value)} // Update state when user changes date
                />
              </div>
              
              {/* Update button */}
              <div className="mb-3 btncapnhat">
                <button type='submit' onClick={(e) => btnName(account._id, e)}>Cập nhật</button>
              </div>
            </form>
          </div>
        )
      }
    </>
  )
}
