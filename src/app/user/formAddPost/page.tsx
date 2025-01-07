'use client';
import { useEffect, useState } from 'react';
import '../formAddPost/formadd.css'
import Nav from '../navbar/page';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avata: string;
}

export default function UploadPost() {
  const [title, setTitle] = useState<string>(''); // State for post title
  const [files, setFiles] = useState<File[]>([]); // State for files
  const [user, setUser] = useState<User | null>(null); // State for user information
  const [fileError, setFileError] = useState<string>(''); // State for file validation error

  // Fetch user information from localStorage
  useEffect(() => {
    const dataUser = localStorage.getItem('user');
    if (dataUser) {
      const parsedUser: User = JSON.parse(dataUser);
      setUser(parsedUser);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

    // Reset the error message and check for valid image types
    setFileError('');
    
    const invalidFiles = selectedFiles.filter(file => !validImageTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setFileError('Chỉ chấp nhận các file ảnh (JPEG, PNG, GIF).');
      return;
    }

    setFiles(selectedFiles); // Set the valid files
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if caption is empty
    if (!title.trim()) {
      alert('Vui lòng nhập caption!');
      return;
    }

    if (!files.length) {
      alert('Vui lòng chọn ít nhất một ảnh!');
      return;
    }

    if (!user) {
      alert('Chưa đăng nhập!');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('idAccount', user._id);
    files.forEach((file) => {
      formData.append('post', file); // Append each file
    });

    try {
      const response = await fetch('http://localhost:4000/post/add', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Đã xảy ra lỗi');
      }

      alert('Bài viết đã được tải lên thành công!');
      setTitle(''); // Reset title
      setFiles([]); // Reset files
      location.href = "/user/homePage";
    } catch (error) {
      console.error('Error uploading post:', error);
      alert('Đã xảy ra lỗi khi upload bài viết');
    }
  };

  return (
    <>
      <Nav />
      <div id="formadd">
        <form onSubmit={handleSubmit}>
          <div className="caption">
            <label>Nhập caption</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Chọn ảnh từ máy:</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              required
            />
            {fileError && <p className="error-message">{fileError}</p>}
          </div>

          <button type="submit">Đăng bài</button>
        </form>
      </div>
    </>
  );
}
