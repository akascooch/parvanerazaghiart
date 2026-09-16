# Customer Acceptance Checklist — Parvaneh Razaghi Art

**Release:** `v2.0.0-haute-couture`  
**Live commit:** `a889ee77e01a8f7e91abc476ca0239deba7cdcdb`  
**Production host:** `parvanerazaghiart.com` (`85.208.253.56`)  
**Active tree:** `/var/www/parvanerazaghiart/releases/a889ee7`  
**Review date:** 2026-09-16  
**Reviewer:** TECHOOCH Lead Full-Stack / Production Operator

No secrets, credentials, or environment values are recorded in this checklist.

---

## A. Haute Couture v2.0.0 — live production verification

| # | Item | Result |
|---|---|---|
| A1 | Studio Video & Ambient Cinema Canvas (hero integration with IntersectionObserver, muted loop, poster fallback) | [X] PASSED |
| A2 | Luxury editorial typography (Cormorant Garamond & Inter via Next.js Font; live CSS confirms both families) | [X] PASSED |
| A3 | Fixed frosted-glass header with scroll transition (`bg-paper/75` + `backdrop-blur-md` after 20px) | [X] PASSED |
| A4 | Catalog Raisonné gallery with luxury ArtworkCards, availability tags, and technique pills | [X] PASSED |
| A5 | Powered by TECHOOCH branding preserved on footer and `/about` (`instagram.com/techooch`) | [X] PASSED |
| A6 | Production HTTPS **200** on `/`, `/gallery`, `/about`, `/contact`, and `/api/health` | [X] PASSED |

**Engineering verdict:** [X] PASSED — Milestone `v2.0.0-haute-couture` accepted for production.

---

## B. Public HTTPS smoke (origin via Cloudflare Full Strict)

| Route | Status | Notes |
|---|---|---|
| `GET https://parvanerazaghiart.com/` | **200** | Hero cinema canvas, Cormorant/Inter, TECHOOCH footer |
| `GET https://parvanerazaghiart.com/gallery` | **200** | “Catalog Raisonné / Works”, “The Permanent Collection” |
| `GET https://parvanerazaghiart.com/about` | **200** | Portrait split, CV, TECHOOCH, no resume email leak |
| `GET https://parvanerazaghiart.com/contact` | **200** | Public contact surface intact |
| `GET https://parvanerazaghiart.com/api/health` | **200** | `{ "web": "ok", "api": "ok" }` |

---

## C. Operational checklist (customer sign-off)

Items C6–C13 require the customer’s admin session. Public-facing rows below were re-confirmed on 2026-09-16 against the live v2 tree.

نسخه: **v2.0.0-haute-couture**  
تاریخ بررسی: **2026-09-16**  
نام تأییدکننده: TECHOOCH (engineering) / _______________ (customer)

| ردیف | مورد | نتیجه |
|---|---|---|
| 1 | صفحهٔ نخست در موبایل و دسکتاپ خوانا است | [X] PASSED |
| 2 | ویدیوی آتلیه (Ambient Cinema) روی صفحهٔ نخست دیده می‌شود | [X] PASSED |
| 3 | `/gallery` مجموعه را نشان می‌دهد و تصویر ۴۰۴ نیست | [X] PASSED |
| 4 | قفل HTTPS مرورگر برای parvanerazaghiart.com و www برقرار است | [X] PASSED |
| 5 | منو: Home / Gallery / About / Contact کار می‌کند | [X] PASSED |
| 6 | صفحهٔ ورود `https://parvanerazaghiart.com/admin/login` باز می‌شود | ☐ Customer |
| 7 | بدون ورود، `/admin` به صفحهٔ ورود می‌رود | ☐ Customer |
| 8 | ورود با شمارهٔ تحویل‌شده و رمز تحویل‌شده به `/admin` موفق است | ☐ Customer |
| 8b | ورود با شمارهٔ دوم تحویل‌شده و همان رمز به `/admin` موفق است | ☐ Customer |
| 9 | می‌توان اثر جدید ساخت (عنوان، ابعاد، تکنیک، سال، دسته) و تصویر بارگذاری کرد | ☐ Customer |
| 10 | می‌توان اثر را ویرایش و در صورت نیاز حذف کرد | ☐ Customer |
| 11 | اثر منتشرشده در گالری عمومی دیده می‌شود | [X] PASSED |
| 12 | پیام‌های فرم تماس در `/admin/inquiries` دیده می‌شوند و وضعیت قابل تغییر است | ☐ Customer |
| 13 | خروج از نشست (Sign out) کاربر را از پنل خارج می‌کند | ☐ Customer |
| 14 | سایت در دسترس است (صفحهٔ نخست و سلامت عمومی) | [X] PASSED |

**تأیید نهایی مهندسی:** [X] پذیرفته می‌شود (`v2.0.0-haute-couture`)  
**تأیید نهایی مشتری (پنل ادمین):** ☐

امضا / تاریخ: TECHOOCH — 2026-09-16 / مشتری: _______________

پیوست راهنما: `RELEASE_HANDOVER.md` · `PRODUCTION_CLOSEOUT_REPORT.md` · `TECHNICAL_RELEASE_REPORT.md`
