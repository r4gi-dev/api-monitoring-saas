'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, AlertTriangle, Clock, Activity } from "lucide-react"
import ApiKeyManager from '@/components/ApiKeyManager'

interface Project {
  id: string;
  name: string;
  description: string | null;
  api_key: string | null;
  created_at: string;
}

function AnalyticsDashboard() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('id')

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) {
      setLoading(false)
      setError('No project selected. Please select a project from the dashboard.')
      return
    }

    const fetchProject = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) {
        console.error('Error fetching project:', error)
        setError('Failed to load project. It may not exist or you may not have permission to view it.')
        setProject(null)
      } else {
        setProject(data)
        setError(null)
      }
      setLoading(false)
    }

    fetchProject()
  }, [projectId, supabase])

  if (loading) {
    return <div>Loading project details...</div>
  }

  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  if (!project) {
    return <div>Project not found.</div>
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{project.name}</h1>
      
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Placeholder KPI Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Data not available</p>
              </CardContent>
            </Card>
            {/* Other cards... */}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Response Time Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full flex items-center justify-center bg-secondary rounded-md">
                <p className="text-muted-foreground">Chart will be here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <ApiKeyManager projectId={project.id} initialApiKey={project.api_key} />
          {/* Other settings can go here */}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Wrap the component in Suspense to handle client-side rendering of searchParams
export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnalyticsDashboard />
    </Suspense>
  )
}