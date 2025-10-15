'use client'

import { useParams } from 'next/navigation'
import ProjectChart from '@/components/ProjectChart'

export default function ProjectDetailPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">プロジェクト詳細</h1>
      
      <div className="bg-gray-800 p-4 rounded mt-6">
        <h2 className="text-lg font-semibold mb-4">ロググラフ</h2>
        <ProjectChart projectId={id} />
      </div>
    </div>
  )
}
