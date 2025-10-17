'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { sendLog } from '@/lib/monitoring' // Import the sendLog function
import ProjectCard from '@/components/ProjectCard'
import { Button } from '@/components/ui/button'

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const supabase = createClient()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const startTime = Date.now();
      let statusCode = 500; // Default to error

      try {
        const { data, error, status } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        statusCode = status;

        // A 406 status from Supabase can mean an empty table, which is not a critical error.
        if (error && status !== 406) {
          throw error;
        }
        
        if (data) {
          setProjects(data);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        statusCode = 500;
      } finally {
        const endTime = Date.now();
        sendLog({
          endpoint: 'supabase:projects:select',
          status_code: statusCode,
          response_ms: endTime - startTime,
        });
        setLoading(false);
      }
    };

    fetchProjects();
  }, [supabase]);

  if (loading) {
    return <div>Loading projects...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No projects yet</h2>
          <p className="text-muted-foreground mt-2 mb-4">Get started by creating your first project.</p>
          <Link href="/projects/new">
            <Button>Create Project</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link href={`/dashboard/analytics?id=${project.id}`} key={project.id}>
              <ProjectCard project={project} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}