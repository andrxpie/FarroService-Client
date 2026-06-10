// Суворо прив'язуємося до твого робочого HTTP порту
const BASE_URL = "";

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  const token = globalThis.window === undefined ? null : localStorage.getItem("farro_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fullUrl = `${BASE_URL}${endpoint}`;

  try {
    console.log()
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Помилка сервера: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`[FarroAPI Error] Критична помилка мережі для: ${fullUrl}`, error);
    throw error;
  }
}
