import { useEffect, useState } from "react"

export default function ShowName({ params }: { params: { id: string } }){
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
                <a href="#" className="text-decoration-none">{name.lastName} {name.firstName}</a>
            )
        }
        </>
    )
}