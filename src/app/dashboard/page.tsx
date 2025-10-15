'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabaseClient'
import { useTheme } from 'next-themes'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

type Project = {
  id: string
  name: string
}

type Log = {
  timestamp: string
  status_code: number
  response_ms: number
  endpoint: string
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const { theme } = useTheme()

  // プロジェクト取得
  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from('projects').select('id,name')
      if (error) return console.error(error)
      setProjects(data)
      if (data.length > 0) setSelectedProject(data[0].id)
    }
    fetchProjects()
  }, [])

  // ログ取得
  useEffect(() => {
    if (!selectedProject) return
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('logs')
        .select('timestamp,status_code,response_ms,endpoint')
        .eq('project_id', selectedProject)
        .order('timestamp', { ascending: true })
      if (error) return console.error(error)
      setLogs(data)
    }
    fetchLogs()
  }, [selectedProject])

  // グラフ用データ作成
  const categories = logs.map((log) => new Date(log.timestamp).toLocaleString())
  const responseTimes = logs.map((log) => log.response_ms)
  const errorCounts = logs.map((log) => (log.status_code >= 400 ? 1 : 0))

  const chartTheme = theme === 'dark' ? 'dark' : 'light';

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      <div className="mb-4">
        <label>プロジェクト選択: </label>
        <select
          className="ml-2 p-2 rounded bg-secondary text-secondary-foreground"
          value={selectedProject || ''}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* レスポンスタイムグラフ */}
        <div className="bg-card text-card-foreground p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">レスポンスタイム (ms)</h2>
          <Chart
            options={{
              chart: { id: 'response-time', background: 'transparent' },
              xaxis: { categories },
              colors: ['#60a5fa'],
              theme: { mode: chartTheme },
            }}
            series={[{ name: 'Response Time', data: responseTimes }]}
            type="line"
            height={300}
          />
        </div>

        {/* エラー件数グラフ */}
        <div className="bg-card text-card-foreground p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">エラー件数</h2>
          <Chart
            options={{
              chart: { id: 'error-count', background: 'transparent' },
              xaxis: { categories },
              colors: ['#f87171'],
              theme: { mode: chartTheme },
            }}
            series={[{ name: 'Errors', data: errorCounts }]}
            type="bar"
            height={300}
          />
        </div>
      </div>
    </>
  )
}