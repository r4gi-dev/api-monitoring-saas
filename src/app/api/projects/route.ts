import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, description, created_at, api_key')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ projects }, { status: 200 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}