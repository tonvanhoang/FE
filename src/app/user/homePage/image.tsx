import { useEffect, useState } from "react";

export default function ShowAccountByPost({ params }: { params: { id: string } }) {
  const [account, setAccount] = useState<any | null>(null);

  useEffect(() => {
    const fetchAccount = async () => {
      const res = await fetch(`http://localhost:4000/account/accountByID/${params.id}`);
      const data = await res.json();
      setAccount(data);
    };
    fetchAccount();
  }, [params.id]);

  return (
    <>
      {account && (
        <img src={`/img/${account.avata}`} alt="Avatar" className="avatar" />
      )}
    </>
  );
}
