import { createClient } from '@/lib/supabase/server';
import { ErrorsDisplay } from './_components/ErrorsDisplay';

export default async function ErrorsPage({
  searchParams,
}: {
  searchParams?: { project_id?: string };
}) {
  const supabase = await createClient();
  const currentProjectId = searchParams?.project_id;

  // 1. Fetch all projects for the dropdown
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, name');

  // 2. Fetch errors, filtered by project_id if provided, otherwise fetch all
  const errorQuery = supabase
    .from('errors')
    .select('id, message, occurred_at')
    .order('occurred_at', { ascending: false })
    .limit(50);

  if (currentProjectId) {
    errorQuery.eq('project_id', currentProjectId);
  }

  const { data: errors, error: errorsError } = await errorQuery;

  // Handle potential errors during data fetching
  if (projectsError || errorsError) {
    const errorMessage = projectsError?.message || errorsError?.message;
    console.error('Error fetching data for Errors page:', errorMessage);
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">Could not fetch data</h2>
        <p className="text-muted-foreground mt-2">{errorMessage}</p>
      </div>
    );
  }

  // 3. Pass the fetched data to the client component for rendering
  return (
    <ErrorsDisplay
      projects={projects || []}
      errors={errors || []}
      currentProjectId={currentProjectId}
    />
  );
}
