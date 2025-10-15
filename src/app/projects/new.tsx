import { useState } from 'react'

export default function NewProjectPage() {
  const [name, setName] = useState('')
  const [userId, setUserId] = useState('')
    const [result, setResult] = useState<Record<string, unknown> | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, name }),
    })
    const data = await res.json()
    setResult(data)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-6">新規プロジェクト作成</h1>
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md w-96">
        <label className="block mb-2">
          <span>ユーザーID</span>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white mt-1"
          />
        </label>
        <label className="block mb-4">
          <span>プロジェクト名</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white mt-1"
          />
        </label>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded w-full"
        >
          作成
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-gray-800 p-4 rounded-lg w-96">
          <p>結果:</p>
          <pre className="text-green-400 text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
