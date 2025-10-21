import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, Mock } from 'vitest';
import ErrorsPage from './page';
import { type ErrorsDisplayProps, type Project, type ErrorRecord } from './_components/ErrorsDisplay';
import { createClient } from '@/lib/supabase/server';

// Define a more specific type for the mocked Supabase result
type SupabaseResult = { data: Project[] | ErrorRecord[] | null; error: { message: string } | null };
type ThenableCallback = (result: SupabaseResult) => void;

// Mock the client component to inspect the props it receives
vi.mock('./_components/ErrorsDisplay', () => ({
  ErrorsDisplay: (props: ErrorsDisplayProps) => {
    return <div data-testid="errors-display">{JSON.stringify(props)}</div>;
  },
}));

// Mock the Supabase client
vi.mock('@/lib/supabase/server');

describe('ErrorsPage Server Component', () => {

  it('should fetch data and pass correct props when no project is selected', async () => {
    // Arrange
    const mockProjects: Project[] = [{ id: 'p1', name: 'Project 1' }];
    const mockErrors: ErrorRecord[] = [{ id: 'e1', message: 'Error 1', occurred_at: '2024-01-01T12:00:00Z'}];
    const eqMock = vi.fn().mockReturnThis();
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'projects') {
          return { select: vi.fn().mockResolvedValue({ data: mockProjects, error: null }) };
        }
        if (table === 'errors') {
          const query = {
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            eq: eqMock,
          };
          // Mock the final chained call
          Object.assign(query, { then: (cb: ThenableCallback) => cb({ data: mockErrors, error: null }) });
          return { select: vi.fn().mockReturnValue(query) };
        }
        return { from: vi.fn().mockReturnThis() };
      }),
    };
    (createClient as Mock).mockResolvedValue(mockSupabase);

    // Act
    const PageComponent = await ErrorsPage({ searchParams: {} });
    render(PageComponent);

    // Assert
    const props = JSON.parse(screen.getByTestId('errors-display').textContent || '{}');
    expect(props.projects).toEqual(mockProjects);
    expect(props.errors).toEqual(mockErrors);
    expect(props.currentProjectId).toBeUndefined();
    expect(eqMock).not.toHaveBeenCalled(); // Filter should not be applied
  });

  it('should fetch data and pass filtered errors when a project is selected', async () => {
    // Arrange
    const projectId = 'p1';
    const mockProjects: Project[] = [{ id: 'p1', name: 'Project 1' }];
    const mockFilteredErrors: ErrorRecord[] = [{ id: 'e2', message: 'Filtered Error', occurred_at: '2024-01-01T12:00:00Z'}];
    const eqMock = vi.fn().mockReturnThis();
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'projects') {
          return { select: vi.fn().mockResolvedValue({ data: mockProjects, error: null }) };
        }
        if (table === 'errors') {
          const query = {
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            eq: eqMock,
          };
          Object.assign(query, { then: (cb: ThenableCallback) => cb({ data: mockFilteredErrors, error: null }) });
          return { select: vi.fn().mockReturnValue(query) };
        }
        return { from: vi.fn().mockReturnThis() };
      }),
    };
    (createClient as Mock).mockResolvedValue(mockSupabase);

    // Act
    const PageComponent = await ErrorsPage({ searchParams: { project_id: projectId } });
    render(PageComponent);

    // Assert
    const props = JSON.parse(screen.getByTestId('errors-display').textContent || '{}');
    expect(props.errors).toEqual(mockFilteredErrors);
    expect(props.currentProjectId).toBe(projectId);
    expect(eqMock).toHaveBeenCalledWith('project_id', projectId); // Filter should be applied
  });

  it('should handle database errors gracefully', async () => {
    // Arrange
    const dbError = { message: 'Database connection failed' };
    // Mock so that fetching projects returns an error
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'projects') {
          return { select: vi.fn().mockResolvedValue({ data: null, error: dbError }) };
        }
        // Mock for 'errors' table is not strictly necessary here but is good practice
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            then: (cb: ThenableCallback) => cb({ data: [], error: null }),
          }),
        };
      }),
    };
    (createClient as Mock).mockResolvedValue(mockSupabase);

    // Act
    const PageComponent = await ErrorsPage({ searchParams: {} });
    render(PageComponent);

    // Assert
    expect(screen.getByText('Could not fetch data')).toBeInTheDocument();
    expect(screen.getByText(dbError.message)).toBeInTheDocument();
  });
});
