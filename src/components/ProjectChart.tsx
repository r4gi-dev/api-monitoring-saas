'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { type ApexOptions } from 'apexcharts'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface Props {
  projectId: string
}

interface Log {
  timestamp: string;
  response_ms: number;
}

export default function ProjectChart({ projectId }: Props) {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await fetch(`/api/projects/${projectId}/logs`)
      const data = await res.json()
      setLogs(data.logs || [])
      setLoading(false)
    }
    fetchLogs()
  }, [projectId])

  if (loading) return <p className="text-gray-500">Loading...</p>

  const categories = logs.map((log) => new Date(log.timestamp).toLocaleString())
  const series = [
    {
      name: 'レスポンス時間(ms)',
      data: logs.map((log) => log.response_ms),
    },
  ]

  const options: ApexOptions = {
    chart: { id: 'response-time-chart', toolbar: { show: false }, background: '#ffffff' },
    xaxis: { categories, labels: { style: { colors: '#4B5563' } } },
    yaxis: { labels: { style: { colors: '#4B5563' } } },
    grid: { borderColor: '#E5E7EB' },
    stroke: { curve: 'smooth', width: 2 },
    colors: ['#3B82F6'],
    tooltip: { theme: 'light' },
  }

  return <Chart options={options} series={series} type="line" height={300} />
}