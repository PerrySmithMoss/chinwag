const isServer = typeof window === "undefined";

const baseUrl = isServer ? process.env.NEXT_PUBLIC_API_BASE_URL : "/api"; // This hits the frontend proxy route

const fetcher = async <T>(
  endpoint: string,
  headers = {}
): Promise<T | null> => {
  try {
    const fullUrl = `${baseUrl}${endpoint}`;
    const res = await fetch(fullUrl, {
      method: "GET",
      credentials: "include",
      headers,
    });

    if (!res.ok) {
      return null;
    }

    const json: T = await res.json();
    return json;
  } catch (e) {
    console.log("Error with fetcher: ", e);
    return null;
  }
};

export default fetcher;
