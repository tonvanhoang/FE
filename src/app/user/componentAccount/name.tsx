'use client'
import { useEffect, useState } from "react";
import io from 'socket.io-client';

// Establish the socket connection
const socket = io('http://localhost:4000');

export default function ShowName({ params }: { params: { id: string } }) {
  const [name, setName] = useState<any>(null);

  useEffect(() => {
    // Fetch account on initial load
    const fetchName = async () => {
      const res = await fetch(`http://localhost:4000/account/accountByID/${params.id}`);
      const data = await res.json();
      setName(data);
    };

    fetchName();

    // Listen for real-time updates when account data is changed
    socket.on('accountUpdated', async (updatedAccountId: string) => {
      if (updatedAccountId === params.id) {
        // Re-fetch account data when the account is updated
        const res = await fetch(`http://localhost:4000/account/accountByID/${params.id}`);
        const updatedData = await res.json();
        setName(updatedData);
      }
    });

    // Clean up socket listener when the component unmounts
    return () => {
      socket.off('accountUpdated');
    };
  }, [params.id]);

  return (
    <>
      {name && (
        <a href="#" className="text-decoration-none">{name.lastName} {name.firstName}</a>
      )}
    </>
  );
}
