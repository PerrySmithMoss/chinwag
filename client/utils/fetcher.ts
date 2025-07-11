type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetchOptions<T> {
  method?: HTTPMethod;
  body?: T;
  headers?: Record<string, string>;
}

const isServer = typeof window === "undefined";
/*
  TODO: will server side requests work, seen as it will not proxy
  through the app rewrites and instead go directly to the API? If we
  request without proxying I don't think our auth cookies will work 
  because the client is (currently) on a different domain to the server.
  
  EDIT: I think it does work because in our getServerSideProps on the client 
  we manually pass the cookie inside the headers
*/
const baseUrl = isServer ? process.env.NEXT_PUBLIC_API_BASE_URL : "/api";

export const fetcher = async <TResponse = unknown, TRequest = unknown>(
  endpoint: string,
  options: FetchOptions<TRequest> = {}
): Promise<TResponse | null> => {
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
    const errorText = await res.text();
    throw new Error(errorText || `API error: ${res.status}`);
  }

  const contentType = res.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return await res.json();
  }

  // Safely return null if no JSON
  return null;
};
