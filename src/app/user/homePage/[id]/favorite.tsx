'use client';
import { useEffect, useState } from 'react';
import io from 'socket.io-client'; // Import Socket.IO client

export default function ShowFavorite({ params }: { params: { id: string } }) {
    const [likeCount, setLikeCount] = useState<number>(0); // Biến để theo dõi số lượt thích

    useEffect(() => {
        // Thiết lập kết nối socket
        const socket = io('http://localhost:4000'); // Kết nối tới server Socket.IO của backend
        // Hàm để lấy số lượt thích ban đầu
        const showFavorite = async () => {
            try {
                const res = await fetch(`http://localhost:4000/favorite/favoriteByPost/${params.id}`);
                const data = await res.json();
                setLikeCount(data.length); // Cập nhật số lượt thích dựa trên số lượng yêu thích
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu yêu thích:', error);
            }
        };
        // Lấy dữ liệu ban đầu khi component được mount
        showFavorite();
        // Lắng nghe sự kiện `favoriteUpdated` từ server
        socket.on('favoriteUpdated', (data: any) => {
            if (data.idPost === params.id) {
                setLikeCount(data.likeCount); // Cập nhật số lượt thích khi sự kiện được nhận
            }
        });
        // Dọn dẹp kết nối socket khi component bị unmount
        return () => {
            socket.disconnect();
        };
    }, [params.id]); // Chạy hiệu ứng này khi `params.id` thay đổi

    return (
        <div>
            <a className="luotThich d-block text-decoration-none text-black" href="#">
                {likeCount} Lượt thích
            </a>
        </div>
    );
}
