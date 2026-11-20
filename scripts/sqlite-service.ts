import { createHash, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { db } from "../lib/local/db";
import { storageOperations } from "../lib/local/storage-operations";

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

const token = process.env.METIS_DB_TOKEN;
if (!token || token.length < 32) throw new Error("Set a random METIS_DB_TOKEN of at least 32 characters.");
const authorization = digest(`Bearer ${token}`);

db();

const server = createServer(async (request, response) => {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST" || request.url !== "/rpc") {
    response.writeHead(404).end();
    return;
  }
  if (!timingSafeEqual(authorization, digest(request.headers.authorization ?? ""))) {
    response.writeHead(401).end();
    return;
  }

  const chunks: Buffer[] = [];
  let size = 0;
  try {
    for await (const chunk of request) {
      size += chunk.length;
      if (size > 1024 * 1024) {
        response.writeHead(413).end();
        return;
      }
      chunks.push(chunk);
    }
  } catch {
    response.writeHead(400).end();
    return;
  }

  let body: { operation?: unknown; args?: unknown } | null;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    response.writeHead(400).end();
    return;
  }
  const operation = body?.operation;
  if (typeof operation !== "string" || !Object.hasOwn(storageOperations, operation) || !Array.isArray(body?.args)) {
    response.writeHead(400).end();
    return;
  }

  try {
    const result = Reflect.apply(storageOperations[operation as keyof typeof storageOperations], undefined, body.args);
    response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ result: result ?? null }));
  } catch (error) {
    console.error("SQLite operation failed:", operation, error);
    response.writeHead(500).end();
  }
});

server.listen(18765, "0.0.0.0", () => console.log("SQLite service listening on port 18765"));
