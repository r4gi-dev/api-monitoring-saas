import { POST } from './route';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('API Route: /api/errors', () => {
  let mockSupabase;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Default mock for a successful insert
    mockSupabase = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      }),
    };
    (createClient as vi.Mock).mockResolvedValue(mockSupabase);
  });

  it('should return 201 and success message on valid payload', async () => {
    // Arrange
    const validPayload = {
      projectId: '123e4567-e89b-12d3-a456-426614174000',
      errorMessage: 'This is a test error',
      timestamp: new Date().toISOString(),
    };
    const request = new NextRequest('http://localhost/api/errors', {
      method: 'POST',
      body: JSON.stringify(validPayload),
      headers: { 'Content-Type': 'application/json' },
    });

    // Act
    const response = await POST(request);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(201);
    expect(body.message).toBe('Error reported successfully');
    expect(mockSupabase.from).toHaveBeenCalledWith('errors');
    expect(mockSupabase.from('errors').insert).toHaveBeenCalledWith({
      project_id: validPayload.projectId,
      message: validPayload.errorMessage,
      stack_trace: undefined,
      metadata: undefined,
      occurred_at: validPayload.timestamp,
    });
  });

  it('should return 400 on missing required fields', async () => {
    // Arrange
    const invalidPayload = {
      projectId: '123e4567-e89b-12d3-a456-426614174000',
      // errorMessage and timestamp are missing
    };
    const request = new NextRequest('http://localhost/api/errors', {
      method: 'POST',
      body: JSON.stringify(invalidPayload),
      headers: { 'Content-Type': 'application/json' },
    });

    // Act
    const response = await POST(request);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body.message).toBe('Missing required fields');
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it('should return 500 if database insert fails', async () => {
    // Arrange
    const validPayload = {
      projectId: '123e4567-e89b-12d3-a456-426614174000',
      errorMessage: 'This is a test error',
      timestamp: new Date().toISOString(),
    };
    const request = new NextRequest('http://localhost/api/errors', {
      method: 'POST',
      body: JSON.stringify(validPayload),
      headers: { 'Content-Type': 'application/json' },
    });

    // Mock a database error
    const dbError = { message: 'Insert failed' };
    mockSupabase.from('errors').insert.mockResolvedValue({ error: dbError });

    // Act
    const response = await POST(request);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(body.message).toBe('Failed to save error report');
    expect(body.error).toBe(dbError.message);
  });
});
