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
| کامیت انتشار | `3ed9d02` (`chore(release): v1.0.0 final handover and persistent media storage`) |
| درخت زنده | `/var/www/parvanerazaghiart/releases/3ed9d02` |
| پیوند `current` | `/var/www/parvanerazaghiart/current` → `releases/3ed9d02` |
| درخت قبلی (rollback نزدیک) | `/var/www/parvanerazaghiart/releases/77cbb46` |
| Rollback قدیمی‌تر | `/var/www/parvanerazaghiart/releases/83018ac` |

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

دو کاربر `ADMIN` روی production همگام و با HTTPS تأیید شدند (رمز در این گزارش نیست):

| شناسهٔ ورود | نمایش‌نام | نقش | Active | ورود HTTPS | `GET /admin` |
|---|---|---|---|---|---|
| `09370504588` | Lord7knows | ADMIN | true | 200 + کوکی | 200 |
| `09192305309` | ParvaneRazaghi | ADMIN | true | 200 + کوکی | 200 |

| مورد | وضعیت |
|---|---|
| الگوریتم | bcrypt cost 12 (همان seed بومی) |
| کوکی | `pra_access` / `pra_refresh` — HttpOnly، Secure، SameSite=Lax |
| ورود نامعتبر | `401` |
| بدنهٔ BFF | توکن JWT در JSON نیست |

رمز در Git و در این گزارش نیست.

---

## حکم

انتشار v1.0.0 با ذخیرهٔ پایدار رسانه، سقف آپلود ۱۲ MiB، و بستهٔ تحویل مشتری آماده است.

---

## Sign-off — v1.1.0 (verified live)

| Item | Value |
|---|---|
| Release | **v1.1.0** (`2ab895e`) |
| Date | 16 September 2026 — verified live |
| Tag | `v1.1.0` (annotated) |
| Live tree | `/var/www/parvanerazaghiart/releases/2ab895e` |
| `current` | `/var/www/parvanerazaghiart/current` → `releases/2ab895e` |
| Immediate rollback | `/var/www/parvanerazaghiart/releases/3ed9d02` |
| Features | Atelier media ingest, `/about` editorial CV, TECHOOCH footer signature, responsive mobile nav |
| Health | Loopback `:3000` / `:3001` OK, public HTTPS OK |

Nginx Origin CA vhost was not rewritten. Shared media path is unchanged.
