# گزارش فنی انتشار — parvanerazaghiart.com

نسخه: **v1.0.0**  
تاریخ: ۲۵ اوت ۲۰۲۶  
دامنه: `parvanerazaghiart.com` / `www.parvanerazaghiart.com`  
کاربر اجرا: `parvane`  
ریشه: `/var/www/parvanerazaghiart`

هیچ رمز، کلید خصوصی، JWT یا رشتهٔ اتصال پایگاه داده در این گزارش نیست.

---

## شناسه‌های Git و درخت انتشار

| مورد | مقدار |
|---|---|
| کامیت انتشار | همان SHA کامیت `chore(release): v1.0.0 final handover and persistent media storage` روی `main` |
| درخت قبلی (rollback نزدیک) | `/var/www/parvanerazaghiart/releases/77cbb46` |
| Rollback قدیمی‌تر | `/var/www/parvanerazaghiart/releases/83018ac` |
| پیوند عملیاتی | `/var/www/parvanerazaghiart/current` → درخت زنده |

پس از استقرار، SHA کوتاه درخت زنده با `readlink -f /var/www/parvanerazaghiart/current` و `git rev-parse --short HEAD` روی `main` یکی است.

Rollback:

```bash
cd /var/www/parvanerazaghiart/releases/77cbb46
pm2 delete parvanerazaghiart-api parvanerazaghiart-web
pm2 start ecosystem.config.cjs --env production
pm2 save
ln -sfn /var/www/parvanerazaghiart/releases/77cbb46 /var/www/parvanerazaghiart/current
```

رسانه در `shared/storage/media` می‌ماند؛ rollback درخت کد را عوض می‌کند نه فایل‌های آپلود.

---

## معماری Persistent Storage

| مورد | مقدار |
|---|---|
| فضای مشترک | `/var/www/parvanerazaghiart/shared/storage/media` |
| مالک / مجوز | `parvane:parvane` / `755` |
| پیوند در هر release | `backend/storage/media` → مسیر shared |
| MEDIA_ROOT | نسبی `./storage/media` (از طریق symlink به shared می‌رسد) |
| سازندهٔ پیوند | `scripts/deploy.sh` (`ensure_persistent_media`) |
| سقف Nginx | `client_max_body_size 20M` |
| سقف Nest / Multer | ۱۲ MiB |
| انواع مجاز | JPEG / PNG / WebP |

آپلود مشتری بین releaseها حفظ می‌شود. کپی دستی `backend/storage` دیگر لازم نیست.

---

## ترافیک، TLS، Nginx

Public: Cloudflare **Full (strict)** → Nginx `:443` (Cloudflare Origin CA) → Next.js BFF `127.0.0.1:3000`.  
Nest فقط loopback `127.0.0.1:3001`. PostgreSQL فقط `127.0.0.1:5432`.

Nginx فایل استاتیک از `current` سرو نمی‌کند؛ `current` برای اپراتور و cwd استقرار است. پروکسی به پورت‌های PM2 است.

- HTTP `:80` → HTTPS
- Origin CA تا اوت ۲۰۴۱
- لبه: گواهی Cloudflare / Google Trust Services

---

## PM2 / BFF / API

| جزء | نقش |
|---|---|
| `parvanerazaghiart-web` | Next.js ۱۴، BFF کوکی/JWT، پورت ۳۰۰۰ |
| `parvanerazaghiart-api` | NestJS، پورت ۳۰۰۱ |
| استقرار | اگر cwd همان درخت باشد: `startOrReload`؛ درخت جدید: delete + start تا cwd دنبال `__dirname` برود |
| Redis | در این نسخه استفاده نمی‌شود |

Health عمومی `GET /api/health`: `web: ok` و `api: ok`. فیلد جدا برای Redis/DB/Storage ندارد.

---

## حساب ادمین

| مورد | وضعیت |
|---|---|
| شناسهٔ ورود | شمارهٔ موبایل کارفرما |
| نقش | `ADMIN`، فعال |
| کوکی | `pra_access` / `pra_refresh` — HttpOnly، Secure، SameSite=Lax |
| الگوریتم رمز | bcrypt cost 12 |

رمز در Git و در این گزارش نیست.

---

## حکم

انتشار v1.0.0 با ذخیرهٔ پایدار رسانه، سقف آپلود ۱۲ MiB، و بستهٔ تحویل مشتری آماده است.
