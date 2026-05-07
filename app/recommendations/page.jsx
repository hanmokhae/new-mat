'use client'

import { useState, useEffect } from 'react'

export default function App() {
    const [senior, setSenior] = useState(null)
    const [recommendations, setRecommendations] = useState([])
    const [supabase, setSupabase] = useState(null)

    // Supabase 로드 및 데이터 가져오기
    useEffect(() => {
        const script = document.createElement('script')
        script.src = '[https://cdn.jsdelivr.net/npm/@supabase/supabase-js](https://cdn.jsdelivr.net/npm/@supabase/supabase-js)'
        script.async = true
        script.onload = () => {
            if (window.supabase) {
                const client = window.supabase.createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
                )
                setSupabase(client)
                fetchData(client)
            }
        }
        document.head.appendChild(script)
    }, [])

    const fetchData = async (client) => {
        // 1. 가장 최근에 등록한 시니어 1명 가져오기
        const { data: seniorData } = await client
            .from('seniors')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)

        if (!seniorData || seniorData.length === 0) return
        const currentSenior = seniorData[0]
        setSenior(currentSenior)

        // 2. 모든 일자리 가져오기
        const { data: jobsData } = await client.from('jobs').select('*')

        // 3. 매칭 점수 계산 로직
        const scoredJobs = jobsData.map(job => {
            let score = 0
            if (job.location === currentSenior.location) score += 3 // 지역 일치 +3점
            if (job.job_role === currentSenior.job_category) score += 2 // 직종 일치 +2점
            return { ...job, score }
        })

        // 4. 점수 높은 순으로 정렬
        const sortedJobs = scoredJobs.sort((a, b) => b.score - a.score)
        setRecommendations(sortedJobs)
    }

    if (!senior) return <div className="p-20 text-3xl text-center">등록된 시니어 정보가 없습니다.</div>

    return (
        <div className="min-h-screen bg-gray-50 p-8 text-gray-900">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-black mb-8 text-blue-800 text-center">
                    🎯 {senior.name}님을 위한 맞춤 일자리
                </h1>

                <div className="grid gap-6">
                    {recommendations.map((job) => (
                        <div key={job.id} className="bg-white p-8 rounded-[30px] shadow-lg border-4 border-blue-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">{job.company_name}</h2>
                                <p className="text-xl text-gray-600">위치: {job.location} | 직무: {job.job_role}</p>
                                <p className="text-xl font-bold text-blue-600 mt-2">매칭 점수: {job.score}점</p>
                            </div>
                            <div className="text-center">
                                <span className="text-5xl block mb-2">{job.score >= 5 ? '⭐' : '✅'}</span>
                                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">상세보기</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
