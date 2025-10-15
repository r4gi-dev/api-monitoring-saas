import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { user_id, name } = body

    if (!user_id || !name) {
      return NextResponse.json({ error: 'user_id and name are required' }, { status: 400 })
    }

    const apiKey = randomUUID()

    const { data, error } = await supabase
      .from('projects')
      .insert([{ user_id, name, api_key: apiKey }])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ project: data }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  
    // errがError以外（stringやobjectなど）の場合も安全に処理
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
