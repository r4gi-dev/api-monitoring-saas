import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>
          Created on {new Date(project.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description || "No description provided."}
        </p>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-primary font-semibold">View Details &rarr;</p>
      </CardFooter>
    </Card>
  )
}
