import { Pool, types, type QueryResultRow } from "pg";

// node-postgres به‌صورت پیش‌فرض ستون‌های NUMERIC و BIGINT را به‌صورت رشته برمی‌گرداند
// (چون این نوع‌ها می‌توانند بزرگ‌تر از محدوده امنِ عدد در جاوااسکریپت باشند).
// اما Supabase/PostgREST قبلاً آن‌ها را به‌صورت عدد JSON برمی‌گرداند و کل فرانت‌اند
// همان رفتار را انتظار دارد؛ پس همینجا آن‌ها را به عدد تبدیل می‌کنیم.
const NUMERIC_OID = 1700; // numeric / decimal
const INT8_OID = 20; // bigint
types.setTypeParser(NUMERIC_OID, (value) => (value === null ? null : parseFloat(value)));
types.setTypeParser(INT8_OID, (value) => (value === null ? null : parseInt(value, 10)));

// این فایل فقط باید در کد سمت سرور (API Routeها یا Server Componentها) import شود.
// هرگز به کامپوننت‌های "use client" ایمپورت نکنید چون pg در مرورگر کار نمی‌کند.

if (!process.env.DATABASE_URL) {
  throw new Error(
    "متغیر DATABASE_URL تنظیم نشده است. فایل .env.local را بررسی کنید (مثال در .env.example)."
  );
}

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

// در محیط dev، Next.js فایل‌ها را هات‌ریلود می‌کند؛ برای جلوگیری از باز شدن
// کانکشن‌های زیاد، pool را روی global نگه می‌داریم.
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
