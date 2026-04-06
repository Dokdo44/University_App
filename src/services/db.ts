/**
 * PostgreSQL client wrapper (server-side / Edge Functions).
 * React Native never connects directly to Postgres — queries run through
 * a Supabase Edge Function or a Node.js API layer.
 */

export interface EnrollmentHealth {
  term: string;
  dept: string;
  course_code: string;
  course_title: string;
  section_code: string;
  instructor: string;
  max_capacity: number;
  enrolled_count: number;
  waitlisted_count: number;
  dropped_count: number;
  fill_pct: number;
}

export interface ForumEngagement {
  department: string;
  forum_name: string;
  total_threads: number;
  total_posts: number;
  unique_authors: number;
  total_reactions: number;
  avg_posts_per_thread: number;
}

export interface WeeklyActivity {
  week_start: string;
  posts: number;
  threads: number;
  event_rsvps: number;
  total_activity: number;
}

/** Base API URL — set via environment variable in .env */
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? '';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const dbService = {
  getForumEngagement: () =>
    get<ForumEngagement[]>('/api/metrics/forum-engagement'),

  getEnrollmentHealth: (termId?: number) =>
    get<EnrollmentHealth[]>(
      `/api/metrics/enrollment-health${termId ? `?term=${termId}` : ''}`,
    ),

  getWeeklyActivity: () =>
    get<WeeklyActivity[]>('/api/metrics/weekly-activity'),
};
