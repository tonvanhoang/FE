'use client';
import { useEffect, useState } from 'react';
import { toast } from "react-toastify";
import io from 'socket.io-client';

interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    avata: string;
}

export default function ShowHeart({ params }: { params: { id: string } }) {
    const [showLikes, setShowLikes] = useState<any[]>([]); // Dữ liệu yêu thích
    const [user, setUser] = useState<User | null>(null); // Thông tin người dùng
    const [isLiked, setIsLiked] = useState<boolean>(false); // Trạng thái thích hay không

    // Lấy thông tin người dùng từ localStorage
    useEffect(() => {
        const dataUser = localStorage.getItem('user');
        if (dataUser) {
            const parsedUser: User = JSON.parse(dataUser);
            setUser(parsedUser);
        }
    }, []);

    // Thiết lập kết nối Socket.IO
    useEffect(() => {
        const socket = io("http://localhost:4000");

        socket.on('favoriteUpdated', (data: { idPost: string, isLiked: boolean, idAccount: string }) => {
            if (data.idPost === params.id && data.idAccount !== user?._id) {
                setIsLiked(data.isLiked); // Cập nhật trạng thái thích
            }
        });

        socket.on('newNotification', (notification) => {
            if (notification.idAccount === user?._id) {
                toast.success(`New notification: ${notification.content}`);
            }
        });

        return () => {
            socket.disconnect(); // Ngắt kết nối khi component bị unmount
        };
    }, [params.id, user]);

    // Lấy danh sách yêu thích của bài viết và kiểm tra người dùng đã thích chưa
    useEffect(() => {
        const showFavorite = async () => {
            try {
                const res = await fetch(`http://localhost:4000/favorite/favoriteByPost/${params.id}`);
                const data = await res.json();
                setShowLikes(data);
                const isUserLiked = data.some((fav: any) => fav.idAccount === user?._id);
                setIsLiked(isUserLiked); // Kiểm tra xem người dùng đã thích bài viết chưa
            } catch (error) {
                console.error('Lỗi khi gọi API:', error);
            }
        };
        if (user) {
            showFavorite(); // Gọi hàm khi người dùng có dữ liệu
        }
    }, [params.id, user]);

    // Xử lý sự kiện khi người dùng click vào yêu thích
    const clickFavorite = async (id: string) => {
        if (!user) {
            toast.error('Bạn cần đăng nhập để thích bài viết.'); // Hiển thị thông báo nếu người dùng chưa đăng nhập
            return;
        }

        try {
            const checkFavorite = await fetch(`http://localhost:4000/favorite/favoriteByPost/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const favoriteData = await checkFavorite.json();
            const isLiked = favoriteData.some((fav: any) => fav.idAccount === user._id);

            // Nếu đã thích bài viết thì xóa yêu thích
            if (isLiked) {
                const res = await fetch(`http://localhost:4000/favorite/removePost`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                    body: JSON.stringify({
                        idAccount: user._id,
                        idPost: id,
                    }),
                });

                if (res.ok) {
                    setIsLiked(false); // Cập nhật trạng thái yêu thích
                    toast.success('Đã xóa yêu thích bài viết.'); // Hiển thị thông báo
                } else {
                    toast.error('Xóa yêu thích thất bại.'); // Thông báo lỗi
                }
            } else {
                // Nếu chưa thích bài viết thì thêm yêu thích
                const newFavorite = {
                    idAccount: user._id,
                    idPost: id,
                };

                const res = await fetch(`http://localhost:4000/favorite/addPost`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                    body: JSON.stringify(newFavorite),
                });
                if (res.ok) {
                    setIsLiked(true); // Cập nhật trạng thái yêu thích
                    const resPostDetail = await fetch(`http://localhost:4000/post/postByID/${id}`);
                    const dataPost = await resPostDetail.json();
                    // Nếu người dùng không phải là chủ sở hữu bài viết, gửi thông báo yêu thích
                    if (user._id !== dataPost.idAccount) {
                        const newNoTi = {
                            idAccount: dataPost.idAccount,
                            idPost: dataPost._id,
                            owner: user._id,
                            content: 'Đã yêu thích bài viết của bạn❤️',
                            type: "post"
                        };
                        await fetch(`http://localhost:4000/notification/addPost`, {
                            headers: {
                                'content-type': 'application/json',
                            },
                            method: 'POST',
                            body: JSON.stringify(newNoTi),
                        });
                    }
                    toast.success('Đã yêu thích bài viết.'); // Hiển thị thông báo thành công
                    io().emit('favoriteUpdated', { idPost: id, isLiked: true, idAccount: user._id }); // Emit event to update other clients
                } else {
                    toast.error('Thêm yêu thích thất bại.'); // Thông báo lỗi
                }
            }
        } catch (error) {
            console.error('Lỗi xử lý yêu thích:', error);
            toast.error('Có lỗi xảy ra. Vui lòng thử lại.'); // Thông báo lỗi tổng quát
        }
    };

    return (
        <i
            className={`fa-heart ${isLiked ? 'fa-solid text-danger' : 'fa-regular'}`}
            onClick={() => clickFavorite(params.id)} // Gọi hàm khi người dùng click vào icon
        ></i>
    );
}