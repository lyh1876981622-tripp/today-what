'use client'

import React, { useState } from 'react'

export default function Home() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const value = text.trim()
    if (!value) return

    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: value, page: 'home' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || '提交失败')

      setText('')
      setMsg('已提交，感谢！')
    } catch (err: any) {
      setMsg(err?.message || '提交失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* 1. 一句话（核心信息） */}
      <h1 className="text-3xl font-bold mb-6 text-center">
        我在做一个工具，帮你每天决定“今天做什么”。<br />
        <span className="text-blue-600">这是第 1 天。</span>
      </h1>

      {/* 2. 站内反馈表单（新增） */}
      <form onSubmit={submit} className="w-full max-w-xl mb-8">
        <div className="border border-slate-200 rounded-2xl p-5 bg-white">
          <h2 className="text-lg font-semibold text-slate-900">
            你希望这个工具帮你解决什么？
          </h2>


          <textarea
            className="w-full mt-4 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-slate-900 placeholder:text-slate-400"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="例如：每天想做的事很多，不知道先做哪个…"
          />

          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="w-full mt-3 bg-blue-600 disabled:bg-slate-300 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            {loading ? '提交中…' : '提交反馈'}
          </button>

          {msg && <p className="text-sm text-slate-600 text-center mt-3">{msg}</p>}
        </div>
      </form>

      <div className="max-w-md text-gray-600 space-y-3 text-center">
        <p>🚧 这不是成品，是正在生长的项目</p>
        <p>📅 我会每天公开迭代，展示过程</p>
        <p>👥 你决定方向，我写代码实现</p>
      </div>
    </div>
  )
}