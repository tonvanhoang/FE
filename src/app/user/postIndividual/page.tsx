import { useEffect, useState } from 'react'
import '../postIndividual/post.css'
import Link from 'next/link'

export default function PostIndividual({params}:{params:{id:string}}) {
    const [posts, setPosts] = useState<any[]>([])

    useEffect(() => {
        const showPosts = async () => {
            const res = await fetch(`http://localhost:4000/post/postByAccount/${params.id}`)
            const data = await res.json()
            setPosts(data)
        }
        showPosts()
    }, [])

    return (
        <div className="content-area" id="containerPosts">
            <div className="photo-grid">
                {posts.map((p: any) => (
                    <div className="photo-row" key={p._id}>
                        {p.post && (
                            <Link href={`/user/detailPostIndividual/${p._id}`}>
                                <img src={`/img/${p.post[0]}`} alt={p.title} />
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
