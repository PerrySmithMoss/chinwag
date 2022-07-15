const fetcher = async <T>(url: string, headers = {}): Promise<T | null> => {
  try {
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers,
    });

    const json: T = await res.json();

    return json;
  } catch (e) {
    console.log("Error with fetcher: ", e);
    return null;
  }
};

export default fetcher;
