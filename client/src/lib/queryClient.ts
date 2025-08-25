import { QueryClient, QueryFunction } from "@tanstack/react-query";

import { createLoginUrl } from "@/lib/auth-utils";

export function handleUnauthorized() {
  try {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    // Keep legacy token for backward compatibility
    localStorage.removeItem("token");
    const currentPath = window.location.pathname + window.location.search;
    if (!currentPath.startsWith("/auth")) {
      const loginUrl = createLoginUrl(currentPath || "/");
      window.location.href = loginUrl;
    }
  } catch {
    // noop
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized();
    }
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function getAccessToken(): string | null {
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
}

function getRefreshToken(): string | null {
  try {
    return localStorage.getItem("refreshToken");
  } catch {
    return null;
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    
    return data.accessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    handleUnauthorized();
    return null;
  }
}

export function buildHeaders(hasBody = false): HeadersInit {
  const token = getAccessToken();
  const headers: Record<string, string> = {};

  if (hasBody) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return headers;
}

export async function buildHeadersWithRefresh(hasBody = false): Promise<HeadersInit> {
  let token = getAccessToken();
  
  // If no token, try to refresh
  if (!token) {
    token = await refreshAccessToken();
  }
  
  const headers: Record<string, string> = {};

  if (hasBody) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return headers;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // First attempt
  let res = await fetch(url, {
    method,
    headers: await buildHeadersWithRefresh(!!data),
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // If we get 401, try to refresh token and retry once
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      // Retry with new token
      res = await fetch(url, {
        method,
        headers: await buildHeadersWithRefresh(!!data),
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn = <T>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;

    // First attempt
    let res = await fetch(url, {
      credentials: "include",
      headers: await buildHeadersWithRefresh(false),
    });

    // If we get 401, try to refresh token and retry once
    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry with new token
        res = await fetch(url, {
          credentials: "include",
          headers: await buildHeadersWithRefresh(false),
        });
      }
    }

    if (options.on401 === "returnNull" && res.status === 401) {
      return null as unknown as T;
    }

    await throwIfResNotOk(res);
    return (await res.json()) as T;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
