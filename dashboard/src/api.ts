import type { Domain, DomainListResponse, DomainStatus, DayStats } from "./types";

// Dev: set VITE_API_URL=http://localhost:8000 in .env.local
// Prod: nginx proxies /api/ → backend, so no env var needed
const BASE = import.meta.env.VITE_API_URL ?? "/api";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("ag_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const resp = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init.headers as Record<string, string>),
    },
  });
  if (resp.status === 401) {
    // Only reload if a session token existed (expired session), not on a failed login attempt
    if (localStorage.getItem("ag_token")) {
      localStorage.removeItem("ag_token");
      window.location.reload();
    }
    throw new Error("Unauthorized");
  }
  if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
  return resp.json() as Promise<T>;
}

type GetDomainsParams = {
  page: number;
  per_page: number;
  search?: string;
  status?: string;
};

export const api = {
  login: (username: string, password: string) =>
    request<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  getDomains: (params: GetDomainsParams) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) qs.set(k, String(v));
    });
    return request<DomainListResponse>(`/domains?${qs}`);
  },

  updateDomainStatus: (id: number, status: DomainStatus) =>
    request<Domain>(`/domains/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  getReportsByDay: () => request<DayStats[]>("/stats/reports-by-day"),
};
