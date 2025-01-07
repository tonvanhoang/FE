'use client'
import { useEffect, useState } from 'react';
import "../../detailPost/detail.css";
import Link from 'next/link';
import CommentPost from '../../commentPost/[id]/page';

export default function DetailPost({ params }: { params: { id: string } }) {
  const [detailPost, setDetailPost] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Xử lý sự kiện nhấn nút Next/Prev
  const handleNextImage = (imagesLength: number) => {
    setCurrentImageIndex(prev => (prev + 1) % imagesLength);
  };

  const handlePrevImage = (imagesLength: number) => {
    setCurrentImageIndex(prev => (prev - 1 + imagesLength) % imagesLength);
  };

  useEffect(() => {
    const showDetail = async () => {
      try {
        const res = await fetch(`http://localhost:4000/post/postByID/${params.id}`);
        const data = await res.json();
        setDetailPost(data);
      } catch (error) {
        console.error("Error fetching post details:", error);
      }
    };
    showDetail();
  }, [params.id]);

  // Nếu không tìm thấy bài viết
  if (!detailPost) {
    return <div style={{ fontSize: '30px', margin: '100px auto' }}>Bài viết không tồn tại</div>;
  }

  // Kiểm tra số lượng ảnh
  const images = detailPost.post || [];
  const hasMultipleImages = images.length > 1;

  return (
    <div className="detailPost" id="detailPost">
      <Link href="/user/homePage">
        <i id="closeCart" className="bi bi-x-lg"></i>
      </Link>
      <div className="childdetailPost">
        <div className="detailRight">
          <div className="item">
            <div className="post-images">
              {/* Hiển thị ảnh hiện tại */}
              {images.length > 0 && (
                <img
                  src={`/img/${images[currentImageIndex]}`}
                  alt="Post Image"
                  className="active"
                />
              )}

              {/* Hiển thị nút chuyển ảnh chỉ khi có nhiều ảnh */}
              {hasMultipleImages && (
                <>
                  <div className="image-indicators">
                    {images.map((_: any, imgIndex: number) => (
                      <span
                        key={imgIndex}
                        className={`image-indicator ${imgIndex === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(imgIndex)}
                      ></span>
                    ))}
                  </div>
                  <div className="post-navigation">
                    <a
                      className="carousel-control-prev-icon prev-btn"
                      onClick={() => handlePrevImage(images.length)}
                    ></a>
                    <a
                      className="carousel-control-next-icon next-btn"
                      onClick={() => handleNextImage(images.length)}
                    ></a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <CommentPost params={params} />
      </div>
    </div>
  );
}
