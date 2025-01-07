'use client'
import React, { useEffect, useState } from "react"

export default function FormPrivate({ params }: { params: { id: string } }) {
    const [post, setPost] = useState<any>(null)
    const [privatepost, setPrivate] = useState<any>('')

    useEffect(() => {
        const fetchPost = async () => {
            const response = await fetch(`http://localhost:4000/post/postByID/${params.id}`)
            const data = await response.json()
            setPost(data)
            setPrivate(data.private)
        }
        fetchPost()
    }, [params.id])

    const editPrivate = async (e: React.FormEvent) => {
        e.preventDefault()
        const newData = {
            private: privatepost
        }
        const response = await fetch(`http://localhost:4000/post/editPrivate/${params.id}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newData),
            method: 'PUT'
        })
        if (response.ok) {
            alert('Chỉnh sửa thành công')
        }
    }
    const closeBTN = () => {
        const formprivate = document.getElementById('formprivate') as HTMLElement;
        if(formprivate){
            formprivate.style.display = 'none'
        }
    }
    return (
        post && (
            <form className="formprivate" id="formprivate">
                <h4>Chỉnh sửa quyền riêng tư</h4>
                <span>Quyền riêng tư hiện tại: {post.private}</span>
                <select
                    className="form-select form-select-lg mb-3"
                    aria-label=".form-select-lg example"
                    onChange={(e) => setPrivate(e.target.value)}
                >
                    <option selected>Vui lòng chọn quyền riêng tư</option>
                    <option value="Bạn bè">Bạn bè</option>
                    <option value="Chỉ mình tôi">Chỉ mình tôi</option>
                </select>
                <button onClick={editPrivate}>lưu</button>
                <button onClick={closeBTN}>Đóng</button>
            </form>
        )
    )
}