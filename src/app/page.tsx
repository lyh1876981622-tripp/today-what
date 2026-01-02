export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* 1. 一句话（核心信息） */}
      <h1 className="text-3xl font-bold mb-8 text-center">
        我在做一个工具，帮你每天决定“今天做什么”。<br />
        <span className="text-blue-600">这是第 1 天。</span>
      </h1>

      {/* 2. 行动按钮（二选一） */}
      <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 transition mb-10">
        我也有这个问题
      </button>
<button className="bg-green-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-green-700 transition mb-10">
  留下邮箱，更新通知你
</button>
      {/* 3. 极简说明（三要点） */}
      <div className="max-w-md text-gray-600 space-y-3 text-center">
        <p>🚧 这不是成品，是正在生长的项目</p>
        <p>📅 我会每天公开迭代，展示过程</p>
        <p>👥 你决定方向，我写代码实现</p>
      </div>
    </div>
  )
}