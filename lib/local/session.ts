import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { db } from "./db";

const accounts = [
  { id: "family", role: "ind" },
  { id: "mother", role: "mother" },
  { id: "caregiver", role: "caregiver" },
  { id: "doctor", role: "doc" },
  { id: "healthworker", role: "hworker" },
  { id: "researcher", role: "res" },
  { id: "asha", role: "asha" },
] as const;

export type Account = (typeof accounts)[number];
export const sessionCookie = "metis_session";
export const sessionMaxAge = 7 * 24 * 60 * 60;

function hash(value: string) {
  return createHash("sha256").update(value).digest();
}

export function authenticate(email: string, password: string) {
  if (!timingSafeEqual(hash(password), hash("aBc@123"))) return null;
  const normalizedEmail = email.trim().toLowerCase();
  const accountEmail = normalizedEmail === "contact@heddle.so" ? "family@heddle.so" : normalizedEmail;
  return accounts.find(({ id }) => accountEmail === `${id}@heddle.so`) ?? null;
}

export function createSession(account: Account) {
  const token = randomBytes(32).toString("hex");
  const now = Date.now();
  const connection = db();
  connection.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(now);
  connection.prepare("INSERT INTO sessions VALUES (?, ?, ?)")
    .run(hash(token).toString("hex"), account.id, now + sessionMaxAge * 1000);
  return token;
}

export function getAccount(token?: string | null) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = db().prepare("SELECT account_id FROM sessions WHERE token_hash = ? AND expires_at > ?")
    .get(hash(token).toString("hex"), Date.now());
  return accounts.find(({ id }) => id === session?.account_id) ?? null;
}

export function removeSession(token?: string | null) {
  if (token) db().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hash(token).toString("hex"));
}
