'use client';

import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Define types for props
export interface Project {
  id: string;
  name: string;
}

export interface ErrorRecord {
  id: string;
  message: string;
  occurred_at: string;
}

export interface ErrorsDisplayProps {
  projects: Project[];
  errors: ErrorRecord[];
  currentProjectId?: string;
}

export function ErrorsDisplay({
  projects,
  errors,
  currentProjectId,
}: ErrorsDisplayProps) {
  const router = useRouter();

  const handleProjectChange = (projectId: string) => {
    // When a new project is selected, update the URL query parameter
    router.push(`/dashboard/errors?project_id=${projectId}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Error Reports</CardTitle>
            <CardDescription>
              Browse and review errors from your projects.
            </CardDescription>
          </div>
          <div className="w-64">
            <Select
              value={currentProjectId}
              onValueChange={handleProjectChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!currentProjectId ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">Select a Project</h2>
            <p className="text-muted-foreground mt-2">
              Choose a project from the dropdown above to see its errors.
            </p>
          </div>
        ) : errors.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">No Errors Reported</h2>
            <p className="text-muted-foreground mt-2">
              This project has no errors. Great job!
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Error</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errors.map((err) => (
                <TableRow key={err.id}>
                  <TableCell>
                    <Badge variant="destructive">New</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium truncate">{err.message}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Date(err.occurred_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
