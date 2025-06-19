const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api"

export async function fetchProjects() {
  const res = await fetch(`${API_BASE}/projects/`)
  const contentType = res.headers.get("content-type")
  if (!res.ok) throw new Error("Failed to fetch projects")
  if (contentType && contentType.includes("application/json")) {
    return res.json()
  } else {
    throw new Error("Backend did not return JSON")
  }
}

export async function createProject(data: { name: string; client?: string }) {
  const res = await fetch(`${API_BASE}/projects/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const contentType = res.headers.get("content-type")
  if (!res.ok) throw new Error("Failed to create project")
  if (contentType && contentType.includes("application/json")) {
    return res.json()
  } else {
    throw new Error("Backend did not return JSON")
  }
}

export async function updateProject(projectId: number, data: Partial<{ status: string; progress: number }>) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const contentType = res.headers.get("content-type")
  if (!res.ok) throw new Error("Failed to update project")
  if (contentType && contentType.includes("application/json")) {
    return res.json()
  } else {
    throw new Error("Backend did not return JSON")
  }
}

// export async function createProject(data: { name: string; client?: string }) {
//   ...
// }

export async function fetchCompletedTaskCount(params?: { project?: number; start?: string; end?: string }) {
  const url = new URL(`${API_BASE}/projects/tasks/completed-count/`)
  if (params) {
    if (params.project) url.searchParams.append('project', String(params.project))
    if (params.start) url.searchParams.append('start', params.start)
    if (params.end) url.searchParams.append('end', params.end)
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch completed task count')
  const data = await res.json()
  return data.completed_tasks
}

export async function fetchCompletedProjectCount(params?: { start?: string; end?: string }) {
  const url = new URL(`${API_BASE}/projects/completed-count/`)
  if (params) {
    if (params.start) url.searchParams.append('start', params.start)
    if (params.end) url.searchParams.append('end', params.end)
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch completed project count')
  const data = await res.json()
  return data.completed_projects
}

