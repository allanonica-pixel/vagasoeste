/**
 * Cliente tipado para a API Hono (services/api).
 * Sempre passa o JWT do Supabase nas rotas autenticadas.
 */

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000'

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((init?.headers as Record<string, string>) ?? {}),
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

// ──────────────────────────────────────────────────────────────
// Tipos de resposta da API
// ──────────────────────────────────────────────────────────────

export interface ApiJob {
  id: string
  title: string
  sector: string
  area: string
  contract_type: string
  neighborhood: string
  city: string
  state: string
  salary_min: number | null
  salary_max: number | null
  description: string
  status: string
  applicants_count: number
  created_at: string
  tags: string[]
}

export interface ApiJobsResponse {
  data: ApiJob[]
  total: number
  page: number
  page_size: number
}

export interface ApiApplicationResponse {
  application_id: string
}

export interface ApiHealthResponse {
  status: 'ok' | 'degraded'
  version: string
}

// ──────────────────────────────────────────────────────────────
// Métodos da API
// ──────────────────────────────────────────────────────────────

export const api = {
  jobs: {
    list: (params?: Record<string, string>, token?: string) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : ''
      return apiFetch<ApiJobsResponse>(`/v1/jobs${qs}`, undefined, token)
    },
    get: (id: string, token?: string) =>
      apiFetch<{ data: ApiJob }>(`/v1/jobs/${id}`, undefined, token),
  },

  applications: {
    create: (jobId: string, token: string) =>
      apiFetch<ApiApplicationResponse>(
        '/v1/applications',
        {
          method: 'POST',
          body: JSON.stringify({ job_id: jobId }),
        },
        token,
      ),
  },

  health: {
    check: () => apiFetch<ApiHealthResponse>('/health'),
  },
}
