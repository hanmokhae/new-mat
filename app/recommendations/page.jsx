'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Recommendations() {
    const [senior, setSenior] = useState(null)
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: sData } = await supabase.from('seniors').select('*').order('created_at', { ascending: false }).limit(1)
                if (!sData || sData.length === 0) return setLoading(false)
                setSenior(sData[0])
                const { data: jData } = await supabase.from('jobs').select('*')
                if (jData) {
                    const scored = jData.map(job => {
                        let score = 0
                        if (job.location === sData[0].location) score += 5
                        if (job.job_role === sData[0].job_category) score += 3
                        return { ...job, score }
                    }).sort((a, b) => b.score - a.score)
                    setJobs(scored)
                }
            } finally { setLoading(false) }
        }
        fetchData()
    }, [])

    if (loading) return <p className="p-20 text-2xl text-center font-bold">로딩 중...</p>
    if (!senior) return <p className="p-20 text-2xl text-center font-bold text-red-600">등록 정보 없음</p>

    return (
        <div className="p-10 bg-gray-100 min-h-screen">
            <h1 className="text-4xl font-bold text-center mb-10">{senior.name}님 맞춤 일자리</h1>
            <div className="grid gap-6">
                {jobs.map(job => (
                    <div key={job.id} className="bg-white p-8 rounded-3xl shadow-lg flex justify-between items-center border-l-8 border-blue-500">
                        <div><h2 className="text-3xl font-bold">{job.company_name}</h2><p className="text-xl text-gray-600">{job.location} | {job.job_role}</p></div>
                        <div className="text-right"><p className="text-blue-600 font-bold text-2xl">매칭: {job.score}점</p></div>
                    </div>
                ))}
            </div>
        </div>
    )
}