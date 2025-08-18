import { buildHeaders, buildHeadersWithRefresh } from "@/lib/queryClient";
const API_BASE = "/api";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}



export async function apiRequest<T = any>(
  method: string,
  endpoint: string,
  data?: any,
  useRefresh = true
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const config: RequestInit = {
    method,
    headers: useRefresh ? await buildHeadersWithRefresh(!!data) : buildHeaders(!!data),
  };

  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      // Try to refresh token and retry once
      if (useRefresh) {
        const { refreshAccessToken } = await import("@/lib/queryClient");
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          // Retry with new token
          return apiRequest(method, endpoint, data, false);
        }
      }
      
      // If refresh failed or not using refresh, handle unauthorized
      const { handleUnauthorized } = await import("@/lib/queryClient");
      handleUnauthorized();
    }
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If we can't parse the error response, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new ApiError(response.status, errorMessage);
    }

    // Handle empty responses (like DELETE operations)
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(0, error instanceof Error ? error.message : "Network error");
  }
}

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string) => apiRequest<T>("GET", endpoint),
  post: <T = any>(endpoint: string, data?: any) => apiRequest<T>("POST", endpoint, data),
  put: <T = any>(endpoint: string, data?: any) => apiRequest<T>("PUT", endpoint, data),
  patch: <T = any>(endpoint: string, data?: any) => apiRequest<T>("PATCH", endpoint, data),
  delete: <T = any>(endpoint: string) => apiRequest<T>("DELETE", endpoint),
};