interface FetchOptions extends RequestInit {
  next?: { revalidate?: number | false; tags?: string[] };
}

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const token = globalThis.window === undefined ? null : localStorage.getItem("farro_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(endpoint, { ...options, headers });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    let message = errorText;
    try {
      const parsed = JSON.parse(errorText) as { message?: string };
      if (parsed?.message) message = parsed.message;
    } catch {
      // not JSON — use raw text
    }
    throw new Error(message || `Помилка сервера: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
