import { useEffect, useState } from "react"
import Link from "next/link"
export default function ShowNameByPost({ params }: { params: { id: string } }){
    const [name,setName] = useState<any>(null)
    useEffect(()=>{
        const fetchName = async ()=>{
            const res = await fetch(`http://localhost:4000/account/accountByID/${params.id}`)
            const data = await res.json()
            setName(data)
        }
        fetchName()
    },[params.id])
    return(
        <>
        {
            name  &&(
                <Link href={`/user/profilePage/${name._id}`}>{name.lastName} {name.firstName}</Link>
            )
        }
        </>
    )
}