import { QueryClient, QueryFunction } from "@tanstack/react-query";

import { createLoginUrl } from "@/lib/auth-utils";

export function handleUnauthorized() {
  try {
    localStorage.removeItem("user");
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

function getToken(): string | null {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export function buildHeaders(hasBody = false): HeadersInit {
  const token = getToken();
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
  const res = await fetch(url, {
    method,
    headers: buildHeaders(!!data),
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;

    const res = await fetch(url, {
      credentials: "include",
      headers: buildHeaders(false),
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
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
