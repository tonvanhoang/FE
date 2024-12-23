'use client'
import { useEffect, useState } from "react";
interface Account {
  _id: string;
  firstName: string;
  lastName: string;
  avata: string; // Đường dẫn hình ảnh đại diện
}

export default function ShowAccount({ params }: { params: { id: string } }) {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    const fetchAccount = async () => {
      const res = await fetch(
        `http://localhost:4000/account/accountByID/${params.id}`
      );
      const data = await res.json();
      setAccount(data);
    };
    fetchAccount();
  }, [params.id]); // Gọi lại khi idAccount thay đổi

  return (
    <>
      {account && (
        <img src={`/img/${account.avata}`} alt={`${account.firstName} ${account.lastName}`} />
      )}
    </>
  );
}
