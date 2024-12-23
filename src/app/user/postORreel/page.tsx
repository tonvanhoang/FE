"use client";
import "../postORreel/css.css";
import Link from "next/link";
export default function ChoosePostOrReel() {
  return (
    <div className="ContainerFormAdd">
      <div className="content">
        <p>Ngày hôm nay của bạn như thế nào?</p>
        <p>Hãy chia sẻ khoảnh khắc của bạn với renet</p>
      </div>
      <div className="item">
        <div className="formAddPost">
          <p>Bạn muốn chia sẻ những bức hình đẹp</p>
          <button>
            <Link href="/user/formAddPost">Thêm bài viết</Link>
          </button>
        </div>
        <div className="formAddReel">
          <p>Bạn muốn chia sẻ nhưng video hay và ý nghĩa </p>

          <button>
            <Link href="/user/formAddReel">Thêm reel</Link>
          </button>
        </div>
      </div>
    </div>
  );
}
