import { type NextRequest } from "next/server";
import { sessionCookie } from "./session";
import { storageOperations } from "./storage-operations";

type Operation = typeof storageOperations;

export async function storage<K extends keyof Operation>(
  operation: K,
  ...args: Parameters<Operation[K]>
): Promise<ReturnType<Operation[K]>> {
  const { METIS_DB_URL: url, METIS_DB_TOKEN: token, VERCEL } = process.env;
  if (!url && !token && !VERCEL) {
    return Reflect.apply(storageOperations[operation], undefined, args);
  }
  if (!url || !token) throw new Error("Remote SQLite requires METIS_DB_URL and METIS_DB_TOKEN.");

  const response = await fetch(new URL("/rpc", url), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ operation, args }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`SQLite service returned HTTP ${response.status}.`);
  return (await response.json()).result;
}

export async function getRequestAccount(request: NextRequest) {
  const token = request.cookies.get(sessionCookie)?.value;
  return token ? storage("getAccount", token) : null;
}
