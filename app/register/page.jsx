'use client'

import { useState, useEffect } from 'react'

/**
 * 시니어 등록 페이지 (App)
 * * 주요 수정 사항:
 * 1. 외부 라이브러리 로드 방식 변경: ESM 임포트 오류를 방지하기 위해 스크립트 태그를 통해 동적으로 로드합니다.
 * 2. 컴포넌트 이름 변경: 실행 환경 규약에 따라 'App'으로 명명하였습니다.
 */
export default function App() {
    const [name, setName] = useState('')
    const [location, setLocation] = useState('서울')
    const [job, setJob] = useState('사무직')
    const [loading, setLoading] = useState(false)
    const [supabase, setSupabase] = useState(null)

    // Supabase 라이브러리 동적 로드
    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js'
        script.async = true
        script.onload = () => {
            // 라이브러리 로드 완료 후 클라이언트 초기화
            if (window.supabase) {
                const client = window.supabase.createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
                )
                setSupabase(client)
            }
        }
        document.head.appendChild(script)

        return () => {
            document.head.removeChild(script)
        }
    }, [])

    // 등록 버튼 클릭 시 실행되는 함수
    const handleRegister = async (e) => {
        e.preventDefault()

        if (!supabase) {
            alert('시스템 준비 중입니다. 잠시만 기다려 주세요.')
            return
        }

        if (!name) {
            alert('성함을 입력해 주세요!')
            return
        }

        setLoading(true)

        try {
            // Supabase의 seniors 테이블에 데이터 저장
            const { error } = await supabase
                .from('seniors')
                .insert([
                    {
                        name: name,
                        location: location,
                        job_category: job
                    }
                ])

            if (error) throw error

            alert('성공적으로 등록되었습니다! 이제 추천 일자리를 확인해 보세요.')
            setName('') // 입력창 초기화
        } catch (error) {
            alert('오류가 발생했습니다: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-gray-900">
            {/* 카드 형태의 컨테이너 */}
            <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-12 border-8 border-blue-50">

                <header className="text-center mb-12">
                    <h1 className="text-5xl font-black text-blue-900 mb-4">
                        👵 시니어 구직 등록
                    </h1>
                    <p className="text-2xl text-gray-500 font-medium">
                        정보를 입력하고 딱 맞는 일자리를 찾아보세요
                    </p>
                </header>

                <form onSubmit={handleRegister} className="space-y-10">
                    {/* 이름 입력란 */}
                    <div className="space-y-3">
                        <label className="block text-3xl font-bold text-gray-800 ml-2">
                            1. 성함을 알려주세요
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="예: 홍길동"
                            className="w-full p-8 text-3xl border-4 border-gray-200 rounded-[25px] focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-300"
                        />
                    </div>

                    {/* 지역 선택 */}
                    <div className="space-y-3">
                        <label className="block text-3xl font-bold text-gray-800 ml-2">
                            2. 희망 근무 지역은 어디인가요?
                        </label>
                        <select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full p-8 text-3xl border-4 border-gray-200 rounded-[25px] focus:border-blue-500 outline-none bg-white appearance-none transition-all cursor-pointer"
                        >
                            <option value="서울">서울특별시</option>
                            <option value="경기">경기도</option>
                            <option value="인천">인천광역시</option>
                            <option value="부산">부산광역시</option>
                        </select>
                    </div>

                    {/* 직종 선택 */}
                    <div className="space-y-3">
                        <label className="block text-3xl font-bold text-gray-800 ml-2">
                            3. 어떤 종류의 일을 찾으시나요?
                        </label>
                        <select
                            value={job}
                            onChange={(e) => setJob(e.target.value)}
                            className="w-full p-8 text-3xl border-4 border-gray-200 rounded-[25px] focus:border-blue-500 outline-none bg-white appearance-none transition-all cursor-pointer"
                        >
                            <option value="사무직">사무직 (문서 관리 등)</option>
                            <option value="배송직">배송직 (운전, 배송 등)</option>
                            <option value="조리원">조리원 (주방 보조 등)</option>
                            <option value="시설관리">시설관리 (경비, 청소 등)</option>
                        </select>
                    </div>

                    {/* 등록 버튼 (아주 크고 파란색) */}
                    <button
                        type="submit"
                        disabled={loading || !supabase}
                        className={`w-full py-10 text-4xl font-black text-white rounded-[30px] shadow-xl shadow-blue-200 transform transition-all active:scale-95 ${(loading || !supabase) ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {loading ? '처리 중...' : (!supabase ? '준비 중...' : '등록하고 일자리 찾기')}
                    </button>
                </form>

                <footer className="mt-12 text-center">
                    <p className="text-xl text-gray-400">
                        도움이 필요하시면 담당 매니저에게 문의해 주세요.
                    </p>
                </footer>
            </div>
        </div>
    )
}