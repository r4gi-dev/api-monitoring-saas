import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// The payload structure from the client
interface ErrorPayload {
  projectId: string;
  errorMessage: string;
  stackTrace?: string;
  timestamp: string; // ISO 8601 format string
  metadata?: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const body: ErrorPayload = await request.json();
    const supabase = await createClient();

    // TODO: Authenticate the request (e.g., check for a valid API key associated with body.projectId)

    // Validate the payload (basic validation)
    if (!body.projectId || !body.errorMessage || !body.timestamp) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Save the error to the database
    const { error: insertError } = await supabase.from('errors').insert({
      project_id: body.projectId,
      message: body.errorMessage,
      stack_trace: body.stackTrace,
      metadata: body.metadata,
      occurred_at: body.timestamp, // Directly use the timestamp from the client
    });

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json({ message: 'Failed to save error report', error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Error reported successfully' }, { status: 201 });
  } catch (error) {
    console.error('Failed to process error report:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Invalid request', error: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
  }
}
