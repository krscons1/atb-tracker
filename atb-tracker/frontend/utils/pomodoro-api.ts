const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";
const POMODORO_ENDPOINT = `${API_BASE}/pomodoros/`;

export interface PomodoroSession {
  id?: number;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  duration: number;   // in minutes
  break_duration?: number;
  cycles?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export async function createPomodoroSession(session: Omit<PomodoroSession, "id" | "created_at" | "updated_at">): Promise<PomodoroSession> {
  const res = await fetch(POMODORO_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
  });
  if (!res.ok) throw new Error("Failed to create pomodoro session");
  return res.json();
}

export async function fetchPomodoroSessions(): Promise<PomodoroSession[]> {
  const res = await fetch(POMODORO_ENDPOINT);
  if (!res.ok) throw new Error("Failed to fetch pomodoro sessions");
  return res.json();
} 