'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Register() {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('성동구')
  const [job, setJob] = useState('바리스타')
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async () => {
    if (!name) return alert('이름을 입력해주세요.')
    setIsLoading(true)

    const { error } = await supabase
      .from('seniors')
      .insert([{ name, location, job_category: job }])

    setIsLoading(false)

    if (error) {
      alert('등록 실패: ' + error.message)
    } else {
      alert('성공적으로 등록되었습니다! 추천 페이지로 이동합니다.')
      window.location.href = '/recommendations'
    }
  }

  return (
    <div className="p-10 text-center">
      <h1 className="text-4xl font-bold mb-10 text-blue-800">일자리 신청하기</h1>
      <input
        className="border-4 p-4 text-2xl mb-4 w-full max-w-md"
        placeholder="이름을 입력하세요"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="flex flex-col items-center gap-4">
        <select className="border-2 p-4 text-xl w-full max-w-md" value={location} onChange={(e) => setLocation(e.target.value)}>
          <option>성동구</option><option>강남구</option><option>도봉구</option><option>서울특별시</option><option>경기도</option>
        </select>
        <select className="border-2 p-4 text-xl w-full max-w-md" value={job} onChange={(e) => setJob(e.target.value)}>
          <option>바리스타</option><option>관리요원</option><option>생활지원사</option><option>도서정리</option><option>배송직</option><option>사무직 (문서 관리 등)</option>
        </select>
        <button
          onClick={handleRegister}
          disabled={isLoading}
          className="bg-blue-600 text-white p-6 text-2xl font-bold rounded-2xl w-full max-w-md disabled:bg-gray-400"
        >
          {isLoading ? '창고에 저장 중...' : '등록하고 일자리 찾기'}
        </button>
      </div>
    </div>
  )
}