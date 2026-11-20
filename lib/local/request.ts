export async function localRequest<T = void>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, options);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "The request failed. Please try again.");
  }
  return response.status === 204 ? undefined as T : response.json();
}

export function postLocal<T = void>(path: string, body: unknown) {
  return localRequest<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
