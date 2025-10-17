'use client'

import { useEffect, useState, Suspense, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, AlertTriangle, Clock, Activity } from "lucide-react"
import ApiKeyManager from '@/components/ApiKeyManager'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface Project {
  id: string;
  name: string;
  description: string | null;
  api_key: string | null;
  created_at: string;
}

interface Log {
  id: number;
  project_id: string;
  timestamp: string;
  status_code: number;
  response_ms: number;
  endpoint: string;
}

function AnalyticsDashboard() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('id')

  const [project, setProject] = useState<Project | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // For project editing
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isUpdatingProject, setIsUpdatingProject] = useState(false)

  useEffect(() => {
    if (!projectId) {
      setLoading(false)
      setError('No project selected. Please select a project from the dashboard.')
      return
    }

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (projectError) {
        console.error('Error fetching project:', projectError)
        setError('Failed to load project. It may not exist or you may not have permission to view it.')
        setProject(null)
        setLoading(false)
        return
      }
      setProject(projectData)
      setEditName(projectData.name)
      setEditDescription(projectData.description || '')

      // Fetch initial logs for the project
      const { data: logsData, error: logsError } = await supabase
        .from('logs')
        .select('*')
        .eq('project_id', projectId)
        .order('timestamp', { ascending: true })

      if (logsError) {
        console.error('Error fetching logs:', logsError)
        setError('Failed to load logs.')
        setLogs([])
      } else {
        setLogs(logsData)
      }

      setLoading(false)
    }

    fetchData()

    // --- Realtime Subscription ---
    const channel = supabase
      .channel(`project_logs_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'logs',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          setLogs((prevLogs) => [...prevLogs, payload.new as Log]);
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount or projectId change
    return () => {
      supabase.removeChannel(channel);
    };
    // --- End Realtime Subscription ---

  }, [projectId, supabase])

  // Handle project update
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProject(true)
    const { error } = await supabase
      .from('projects')
      .update({ name: editName, description: editDescription })
      .eq('id', projectId!)

    if (error) {
      alert('Failed to update project: ' + error.message)
    } else {
      alert('Project updated successfully!')
      // Optionally refresh project data
      setProject(prev => prev ? { ...prev, name: editName, description: editDescription } : null)
    }
    setIsUpdatingProject(false)
  }

  // Handle project deletion
  const handleDeleteProject = async () => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId!)

    if (error) {
      alert('Failed to delete project: ' + error.message)
    } else {
      alert('Project deleted successfully!')
      router.push('/dashboard') // Redirect to dashboard after deletion
      router.refresh() // Refresh dashboard to show updated project list
    }
  }

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalRequests = logs.length
    const errorRequests = logs.filter(log => log.status_code >= 400).length
    const errorRate = totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0
    const totalResponseTime = logs.reduce((sum, log) => sum + log.response_ms, 0)
    const avgResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0

    return {
      totalRequests,
      errorRate: errorRate.toFixed(2),
      avgResponseTime: avgResponseTime.toFixed(0),
    }
  }, [logs])

  // Prepare chart data
  const chartData = useMemo(() => {
    const categories = logs.map(log => new Date(log.timestamp).toLocaleTimeString())
    const responseTimes = logs.map(log => log.response_ms)

    return {
      options: {
        chart: { id: 'response-time-chart', toolbar: { show: false } },
        xaxis: { categories: categories },
        stroke: { curve: 'smooth' },
        markers: { size: 0 },
        tooltip: { x: { format: 'HH:mm:ss' } },
        dataLabels: { enabled: false },
        colors: ['#60a5fa'], // blue-400
      },
      series: [{
        name: 'Response Time',
        data: responseTimes,
      }],
    }
  }, [logs])

  if (loading) {
    return <div className="p-4 text-center">Loading project data...</div>
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>
  }

  if (!project) {
    return <div className="p-4 text-center text-muted-foreground">Project not found.</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{project.name}</h1>
      
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.totalRequests}</div>
                <p className="text-xs text-muted-foreground">Total API calls recorded</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.errorRate}%</div>
                <p className="text-xs text-muted-foreground">Requests with status &gt;= 400</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.avgResponseTime}ms</div>
                <p className="text-xs text-muted-foreground">Average latency</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Chart Area */}
          <Card>
            <CardHeader>
              <CardTitle>Response Time Over Time</CardTitle>
              <CardDescription>Last {kpis.totalRequests} requests</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {logs.length > 0 ? (
                <Chart
                  options={chartData.options}
                  series={chartData.series}
                  type="line"
                  height={350}
                />
              ) : (
                <div className="h-[350px] w-full flex items-center justify-center bg-secondary rounded-md">
                  <p className="text-muted-foreground">No log data available for charting.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Project Details Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Update your project's name and description.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectDescription">Description</Label>
                  <Textarea
                    id="projectDescription"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={isUpdatingProject}>
                  {isUpdatingProject ? 'Updating...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* API Key Manager */}
          <ApiKeyManager projectId={project.id} initialApiKey={project.api_key} />

          {/* Delete Project Section */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Delete Project</CardTitle>
              <CardDescription>Permanently delete your project and all associated data. This action cannot be undone.</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Project</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your project
                      and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading analytics...</div>}>
      <AnalyticsDashboard />
    </Suspense>
  )
}
