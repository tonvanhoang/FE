'use client';
import React, { useEffect, useState } from 'react';
import '../../editAvata/[id]/avata.css';
import Link from 'next/link';

interface Account {
  _id: string;
  avata: string;
  [key: string]: any;
}

export default function EditAvatar({ params }: { params: { id: string } }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null); // Add state for file error

  useEffect(() => {
    if (!params.id) return;

    const fetchAccount = async () => {
      try {
        const res = await fetch(`http://localhost:4000/account/accountByID/${params.id}`);
        if (!res.ok) throw new Error('Không thể tải thông tin tài khoản');
        const data = await res.json();
        setPreview(data.avata || '');
        setAccount(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    fetchAccount();
  }, [params.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);

    if (file) {
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        setFileError('Vui lòng chọn một tệp ảnh hợp lệ!');
        setPreview(null); // Reset preview if file is not an image
        return;
      }

      setFileError(null); // Reset file error if file is valid
      const filePreview = URL.createObjectURL(file);
      setPreview(filePreview);
    }
  };

  const handleEditAvatar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Vui lòng chọn một tệp ảnh!');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      const res = await fetch(`http://localhost:4000/account/editAvata/${params.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) throw new Error('Cập nhật ảnh đại diện thất bại');
      alert('Thay đổi ảnh đại diện thành công!');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (error) {
    return <p className="text-danger">Lỗi: {error}</p>;
  }

  return (
    <>
      {account && (
        <div id="formEditPro">
          {/* Nút đóng */}
          <Link href={`/user/editProfilePage/${account._id}`}>
            <i id="closeCart" className="bi bi-x-lg"></i>
          </Link>

          {/* Form chỉnh sửa ảnh đại diện */}
          <form onSubmit={handleEditAvatar}>
            <h4>Thay đổi ảnh đại diện</h4>
            <hr />
            <div className="mb-3 Input">
              <label className="form-label">Chọn ảnh đại diện mới</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
              {fileError && <p className="text-danger">{fileError}</p>} {/* Display error if file is invalid */}
              {preview && (
                <div className="mt-3">
                  <p>Ảnh đại diện mới:</p>
                  <img
                    src={preview}
                    alt="Preview"
                    style={{ width: '150px', height: '150px', borderRadius: '50%' }}
                  />
                </div>
              )}
            </div>
            {/* Nút cập nhật */}
            <div className="mb-3 btncapnhat">
              <button type="submit" className="btn btn-primary">
                Cập nhật
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
