import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { api_key, endpoint, status_code, response_ms } = body

    if (!api_key || !endpoint || !status_code || !response_ms) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('api_key', api_key)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { error: logError } = await supabase.from('logs').insert([
      {
        project_id: project.id,
        endpoint,
        status_code,
        response_ms,
      },
    ])

    if (logError) return NextResponse.json({ error: logError.message }, { status: 500 })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  
    // errがError以外（stringやobjectなど）の場合も安全に処理
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
