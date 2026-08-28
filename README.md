# املاک شاپور

پروژه Next.js برای آگهی‌های ملکی (خرید/اجاره). دیتابیس این پروژه از **Supabase** به **Postgres روی سرور VPS شخصی شما** تغییر کرد. آپلود تصاویر هم دیگر از Supabase Storage استفاده نمی‌کند و مستقیم روی دیسک خودِ سرور (`public/uploads/properties`) ذخیره می‌شود.

## تغییرات نسبت به نسخه‌ی Supabase

- هیچ کد سمت کلاینت (مرورگر) دیگر مستقیم به دیتابیس وصل نمی‌شود. تمام رفت‌وآمد به دیتابیس از طریق API Routeهای خودِ Next.js (`src/app/api/...`) انجام می‌شود که روی سرور اجرا می‌شوند و به Postgres شما با `pg` وصل می‌شوند (`src/lib/db.ts`).
- رمز عبور پنل ادمین که قبلاً داخل کدِ کلاینت نوشته شده بود (و در باندل جاوااسکریپت قابل مشاهده بود) الان فقط در فایل `.env.local` روی سرور نگه‌داری می‌شود و بررسی‌اش هم سمت سرور انجام می‌گیرد؛ ورود به پنل با یک کوکی `httpOnly` امن مدیریت می‌شود.
- `middleware.ts` که قبلاً محافظتش غیرفعال (کامنت) بود، الان واقعاً مسیرهای `/admin/*` را چک می‌کند.
- آپلود عکس‌ها روی خودِ سرور شما ذخیره می‌شود، نه Supabase Storage.

## پیش‌نیازها روی VPS

- Node.js نسخه ۲۰ به بالا
- PostgreSQL (نسخه ۱۴ به بالا پیشنهاد می‌شود) — همان چیزی که خودتان روی سرور نصب و اجرا می‌کنید
- (اختیاری ولی پیشنهادی) Nginx برای reverse proxy و PM2 یا systemd برای اجرای دائمی اپ

## مرحله ۱ — ساخت دیتابیس و کاربر Postgres

روی سرورتان، وارد psql شوید:

```bash
sudo -u postgres psql
```

سپس:

```sql
CREATE DATABASE amlak;
CREATE USER amlak_user WITH ENCRYPTED PASSWORD 'یک-رمز-قوی-اینجا';
GRANT ALL PRIVILEGES ON DATABASE amlak TO amlak_user;
\c amlak
GRANT ALL ON SCHEMA public TO amlak_user;
\q
```

## مرحله ۲ — ساخت جدول‌ها

فایل `scripts/schema.sql` جدول `properties` و ایندکس‌های لازم را می‌سازد:

```bash
psql "postgresql://amlak_user:رمز-شما@127.0.0.1:5432/amlak" -f scripts/schema.sql
```

اگر پروژه و Postgres روی یک سرور هستند از `127.0.0.1` استفاده کنید (نیازی به باز کردن پورت ۵۴۳۲ به اینترنت نیست و امن‌تر است).

## مرحله ۳ — تنظیم متغیرهای محیطی

فایل `.env.example` را کپی کنید:

```bash
cp .env.example .env.local
```

و مقادیر زیر را در `.env.local` با مقادیر واقعی خودتان جایگزین کنید:

```env
DATABASE_URL=postgresql://amlak_user:رمز-شما@127.0.0.1:5432/amlak
ADMIN_PASSWORD=یک-رمز-قوی-برای-ورود-به-پنل-ادمین
ADMIN_SESSION_SECRET=یک-رشته-تصادفی-و-طولانی
```

برای ساخت یک رشته تصادفی برای `ADMIN_SESSION_SECRET` می‌توانید این را اجرا کنید:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## مرحله ۴ — نصب و اجرا

```bash
npm install
npm run build
npm run start   # روی پورت 3000 اجرا می‌شود
```

برای توسعه محلی: `npm run dev`

## اجرای دائمی روی VPS (پیشنهادی: PM2)

```bash
npm install -g pm2
pm2 start npm --name amlak -- start
pm2 save
pm2 startup   # دستوری که چاپ می‌کند را اجرا کنید تا بعد از ریبوت سرور هم بالا بیاید
```

سپس با Nginx یک reverse proxy به پورت 3000 بسازید و SSL (Let's Encrypt / certbot) را روی دامنه‌تان فعال کنید.

## پوشه آپلود تصاویر

تصاویر آگهی‌ها داخل `public/uploads/properties/` ذخیره می‌شوند. اگر از Docker یا استقرار بدون‌حالت (stateless) استفاده می‌کنید، حتماً این پوشه را به یک volume دائمی متصل کنید تا با هر دیپلوی جدید عکس‌ها پاک نشوند.

## پشتیبان‌گیری (Backup)

چون همه‌چیز روی سرور خودتان است، پیشنهاد می‌شود یک بک‌آپ دوره‌ای هم از دیتابیس و هم از پوشه `public/uploads` بگیرید، مثلاً:

```bash
pg_dump "postgresql://amlak_user:رمز-شما@127.0.0.1:5432/amlak" > backup-$(date +%F).sql
tar -czf uploads-backup-$(date +%F).tar.gz public/uploads
```

## ساختار API

| مسیر | متد | توضیح | نیاز به لاگین ادمین |
|---|---|---|---|
| `/api/properties?type=&meterMin=&order=&limit=&count=` | GET | لیست/تعداد آگهی‌ها | خیر |
| `/api/properties` | POST | ثبت آگهی جدید | بله |
| `/api/properties/[id]` | GET/PUT/DELETE | یک آگهی | GET خیر، بقیه بله |
| `/api/properties/slug/[slug]` | GET | آگهی بر اساس slug (یا id قدیمی) | خیر |
| `/api/upload` | POST/DELETE | آپلود/حذف تصویر | بله |
| `/api/admin/login` | POST | ورود ادمین | - |
| `/api/admin/logout` | POST | خروج ادمین | - |
| `/api/admin/check` | GET | بررسی وضعیت نشست | - |

---

پروژه با [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) ساخته شده و از [Next.js](https://nextjs.org) استفاده می‌کند. برای اطلاعات بیشتر درباره‌ی خودِ Next.js به [مستندات رسمی](https://nextjs.org/docs) مراجعه کنید.
