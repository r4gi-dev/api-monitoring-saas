import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with the service role key
// This client can bypass RLS policies
const supabaseAdmin = await createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  // 1. Authenticate the request with the API key
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 })
  }
  const apiKey = authHeader.substring(7)

  // 2. Find the project associated with the API key
  const { data: project, error: projectError } = await supabaseAdmin
    .from('projects')
    .select('id, user_id')
    .eq('api_key', apiKey)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 403 })
  }

  // 3. Parse and validate the request body
  let logData
  try {
    logData = await req.json()
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { endpoint, status_code, response_ms } = logData

  if (endpoint === undefined || status_code === undefined || response_ms === undefined) {
    return NextResponse.json({ error: 'Missing required log fields' }, { status: 400 })
  }

  // 4. Insert the log into the database
  const { error: logError } = await supabaseAdmin.from('logs').insert([
    {
      project_id: project.id,
      endpoint,
      status_code,
      response_ms,
    },
  ])

  if (logError) {
    console.error('Error inserting log:', logError)
    return NextResponse.json({ error: 'Failed to record log', details: logError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Log recorded' }, { status: 201 })
}