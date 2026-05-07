'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// 정식 Supabase 클라이언트 연결
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
                // 1. 창고에서 최신 등록자 1명 꺼내오기
                const { data: sData, error: sError } = await supabase
                    .from('seniors')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(1)

                if (sError) throw sError
                if (!sData || sData.length === 0) {
                    setLoading(false)
                    return
                }

                const currentSenior = sData[0]
                setSenior(currentSenior)

                // 2. 일자리 목록 꺼내와서 점수 계산하기
                const { data: jData, error: jError } = await supabase.from('jobs').select('*')
                if (jError) throw jError

                if (jData) {
                    const scored = jData.map(job => {
                        let score = 0
                        if (job.location === currentSenior.location) score += 5
                        if (job.job_role === currentSenior.job_category) score += 3
                        return { ...job, score }
                    }).sort((a, b) => b.score - a.score)
                    setJobs(scored)
                }
            } catch (error) {
                console.error("데이터 불러오기 실패:", error)
            } finally {
                setLoading(false) // 로딩 끝
            }
        }

        fetchData()
    }, [])

    if (loading) return <p className="p-20 text-2xl text-center font-bold">데이터를 불러오는 중입니다...</p>
    if (!senior) return <p className="p-20 text-2xl text-center font-bold text-red-600">등록된 시니어 정보가 없습니다. 가입을 먼저 진행해주세요.</p>

    return (
        <div className="p-10 bg-gray-100 min-h-screen">
            <h1 className="text-4xl font-bold text-center mb-10">{senior.name}님을 위한 맞춤 일자리</h1>
            <div className="grid gap-6">
                {jobs.map(job => (
                    <div key={job.id} className="bg-white p-8 rounded-3xl shadow-lg flex justify-between items-center border-l-8 border-blue-500">
                        <div>
                            <h2 className="text-3xl font-bold">{job.company_name}</h2>
                            <p className="text-xl text-gray-600">{job.location} | {job.job_role}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-blue-600 font-bold text-2xl">매칭: {job.score}점</p>
                            <p className="text-gray-500">{job.salary || '급여 협의'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}