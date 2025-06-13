type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetchOptions<T> {
  method?: HTTPMethod;
  body?: T;
  headers?: Record<string, string>;
}

const isServer = typeof window === "undefined";
// TODO: will server side requests work seen as it will not proxy
// through the app rewrites if we use NEXT_PUBLIC_API_BASE_URL? If we
// request without proxying I don't think our auth cookies will work
const baseUrl = isServer ? process.env.NEXT_PUBLIC_API_BASE_URL : "/api";

export const fetcher = async <TResponse = unknown, TRequest = unknown>(
  endpoint: string,
  options: FetchOptions<TRequest> = {}
): Promise<TResponse> => {
  const { method = "GET", body, headers = {} } = options;

  const fullUrl = `${baseUrl}${endpoint}`;
  const res = await fetch(fullUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return await res.json();
};
