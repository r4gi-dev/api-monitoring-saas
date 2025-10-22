import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { reportServerError } from '@/lib/monitoring';

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      reportServerError(new Error('Unauthorized access to projects API'), { apiRoute: '/api/projects', type: 'UnauthorizedAccess' });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, description, created_at, api_key')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      reportServerError(new Error(error.message), { apiRoute: '/api/projects', type: 'SupabaseFetchError', details: error });
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ projects }, { status: 200 })
  } catch (err: unknown) {
    console.error('Failed to process projects API request:', err);
    if (err instanceof Error) {
      reportServerError(err, { apiRoute: '/api/projects', type: 'RequestProcessingError' });
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    reportServerError(new Error(String(err)), { apiRoute: '/api/projects', type: 'UnknownRequestProcessingError' });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}