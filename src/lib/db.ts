import { Pool, types, type QueryResultRow } from "pg";
const NUMERIC_OID = 1700; 
const INT8_OID = 20; 
types.setTypeParser(NUMERIC_OID, (value) => (value === null ? null : parseFloat(value)));
types.setTypeParser(INT8_OID, (value) => (value === null ? null : parseInt(value, 10)));


if (!process.env.DATABASE_URL) {
  throw new Error(
    "متغیر DATABASE_URL تنظیم نشده است. فایل .env.local را بررسی کنید (مثال در .env.example)."
  );
}

declare global {
  var __pgPool: Pool | undefined;
}

const pool =
  global.__pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.DATABASE_URL.includes("sslmode=require") ||
      process.env.PGSSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== "production") {
  global.__pgPool = pool;
}

pool.on("error", (err) => {
  console.error("❌ خطای غیرمنتظره در Postgres pool:", err);
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  return pool.query<T>(text, params as never[]);
}

export default pool;
