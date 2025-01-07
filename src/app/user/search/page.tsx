import React, { useState, useEffect } from 'react';
import '../search/search.css';
import Link from 'next/link';
interface Account {
  _id:string;
  firstName: string;
  lastName: string;
}

// Hàm loại bỏ dấu từ chuỗi
const removeAccents = (str: string) => {
  return str
    .normalize('NFD') // Chuẩn hóa Unicode
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ các ký tự dấu
    .toLowerCase(); // Chuyển thành chữ thường
};

export default function Search() {
  const [accounts, setAccounts] = useState<Account[]>([]); // State to store accounts
  const [searchTerm, setSearchTerm] = useState<string>(''); // State for search term
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]); // State for filtered results
  useEffect(() => {
    // Fetch all accounts from the API
    fetch('http://localhost:4000/account/allAccount')
      .then(response => response.json())
      .then((data: Account[]) => setAccounts(data))
      .catch(error => console.error('Error fetching accounts:', error));
  }, []);

  useEffect(() => {
    // Chỉ lọc khi có từ khóa tìm kiếm
    if (searchTerm.trim() === '') {
      setFilteredAccounts([]); // Không hiển thị gì nếu từ khóa rỗng
    } else {
      const normalizedSearchTerm = removeAccents(searchTerm); // Loại bỏ dấu khỏi searchTerm
      const results = accounts.filter(account => {
        const fullName = `${account.firstName} ${account.lastName}`;
        const normalizedFullName = removeAccents(fullName); // Loại bỏ dấu khỏi tên đầy đủ
        return normalizedFullName.includes(normalizedSearchTerm);
      });
      setFilteredAccounts(results);
    }
  }, [searchTerm, accounts]);

  return (
    <>
      <ul className="ulnavcon" id="ulnavcon" style={{ display: 'none' }}>
        <div className="containercon">
          <h4>Tìm kiếm</h4>
          <div className="Divform">
            <form action="">
              <input
                type="text"
                placeholder="Tìm kiếm tài khoản"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // Update search term
              />
              <button type="button">Tìm kiếm</button>
            </form>
          </div>
          <div className="ganday">
            <div>
              <h6>Kết quả tìm kiếm</h6>
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((account, index) => (
                  <div key={index} className="lichsu">
                    <Link className='' href={`/user/profilePage/${account._id}`}>{account.firstName} {account.lastName}</Link>
                  </div>
                ))
              ) : (
                searchTerm.trim() !== '' && <p>Không tìm thấy kết quả.</p>
              )}
            </div>
          </div>
        </div>
      </ul>
    </>
  );
}
