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
  const [error, setError] = useState<string | null>(null); // State to store error message

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/account/accountByID/${params.id}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch account");
        }
        const data = await res.json();
        setAccount(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
    };
    fetchAccount();
  }, [params.id]); // Gọi lại khi idAccount thay đổi

  return (
    <>
      {error && <p>Error: {error}</p>} {/* Display error message if there is an error */}
      {account ? (
        <img
          src={`/img/${account.avata}`}
          alt={`${account.firstName} ${account.lastName}`}
          onError={(e) => e.currentTarget.src = "/img/default-avatar.png"} // Fallback image on error
        />
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}
