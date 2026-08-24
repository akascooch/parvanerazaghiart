# بسته انتقال Parvane Razaghi Art — v1.0.0

HEAD موردنظر: `3d79e19020008792a903f60176dc62c394d996a2` روی شاخه `main`.

`Production was not modified.` این بسته از workstation محلی ساخته شده است. Dump دیتابیس (اگر باشد) **بکاپ Production نیست**.

## 1. آرشیو امن برای سورس پروژه

`parvanerazaghiart-v1.0.0-project.zip`

شامل کد، اسکریپت‌های deploy، Prisma، docs، lockfile. شامل `.env` واقعی، کلید خصوصی، `node_modules`، `.next` و dump دیتابیس نیست.

## 2. آرشیو حساس (خصوصی)

`parvanerazaghiart-v1.0.0-sensitive.zip` باید با AES-256 ساخته شود.

در این نشست Cursor ساخته نشد؛ ببینید `SENSITIVE_PACKAGE_NOT_CREATED.txt` و `create-sensitive-archive.ps1`.

محتوای مورد انتظار پس از ساخت دستی:

- `Local Info.txt`
- `Server Info.txt` (اطلاعات زیرساخت حساس است؛ عمومی پخش نشود)
- dump محلی `database/*.dump` اگر وجود داشته باشد
- `SENSITIVE_MANIFEST.txt` (فقط نام فایل و SHA256)

## 3. کپی به سیستم دوم

1. `parvanerazaghiart-v1.0.0-project.zip` را با USB/دیسک/شبکه داخلی کپی کنید.
2. آرشیو حساس را جدا و فقط از کانال خصوصی ببرید.
3. `SHA256SUMS.txt` را همراه ببرید و قبل از باز کردن مقایسه کنید.
4. dump خام و Info خام را بدون رمز روی فلش نگذارید.

## 4. بررسی SHA256

```powershell
Get-FileHash -Algorithm SHA256 .\parvanerazaghiart-v1.0.0-project.zip
Get-Content .\SHA256SUMS.txt
```

روی لینوکس: `sha256sum -c SHA256SUMS.txt`

## 5. بازرسی مخزن

```powershell
Expand-Archive parvanerazaghiart-v1.0.0-project.zip -DestinationPath .\pra-src
cd .\pra-src
git status
git log --oneline -8
git rev-parse HEAD
```

اگر zip از `git archive` آمده و پوشه `.git` ندارد، روی سیستم دوم:

```powershell
git init
git checkout -b main
git add .
git commit -m "import parvanerazaghiart v1.0.0 from transfer package"
```

سپس remote را اضافه کنید. تاریخچهٔ کامل Git فقط وقتی حفظ می‌شود که به‌جای zip، کل clone (با `.git`) را کپی کنید. این zip عمداً بدون secrets و بدون `node_modules` است.

برای حفظ تاریخچه روی سیستم دوم، پوشهٔ پروژهٔ اصلی را با `robocopy`/`git bundle` ببرید. Bundle پیشنهادی (روی مبدأ، اگر شبکه هنوز بسته است):

```powershell
git bundle create parvanerazaghiart-v1.0.0.bundle --all
```

فایل bundle در صورت وجود در همین پوشه، تاریخچه را بدون GitHub منتقل می‌کند.

## 6. نصب وابستگی روی سیستم دوم

Node 20+ و pnpm 9+. از ریشهٔ پروژه:

```powershell
pnpm --dir backend install --frozen-lockfile
pnpm --dir frontend install --frozen-lockfile
pnpm --dir backend exec prisma generate
```

`prisma-engines-manual` ویندوزی را به لینوکس کپی نکنید.

## 7. تست

```powershell
# backend — در صورت نیاز Prisma engine محلی
pnpm --dir backend test
pnpm --dir backend test:e2e
pnpm --dir frontend exec tsc --noEmit
pnpm --dir backend build
pnpm --dir frontend build
```

## 8. پیکربندی انتقال GitHub

Remote فعلی مبدأ: `git@github.com:akascooch/parvanerazaghiart.git`  
Remote را خودکار عوض نکنید.

**OPTION 1 — HTTPS (ترجیح پس از باز شدن 443):**

```text
https://github.com/akascooch/parvanerazaghiart.git
```

- Git Credential Manager
- توکن با حداقل دسترسی (repo)
- توکن در URL و history نباشد
- قبل از push: `git ls-remote`

```powershell
git remote set-url origin https://github.com/akascooch/parvanerazaghiart.git
git ls-remote origin
```

**OPTION 2 — SSH روی 443 (فقط مستندات؛ config را خودکار عوض نکنید):**

```sshconfig
Host github.com
    HostName ssh.github.com
    Port 443
    User git
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    StrictHostKeyChecking yes
```

کلید خصوصی را چاپ یا کپی به zip نکنید. Host-key checking را خاموش نکنید.

**OPTION 3 — VPN معتبر:** فقط دستی. Kill-switch، DNS leak protection، split tunnel در حد GitHub، MTU حدود 1280–1380، rollback = قطع تونل. بعد از اتصال دوباره diagnostic و `git ls-remote`.

## 9. Push فقط با مجوز صریح

```text
git push -u origin main
```

Force-push ممنوع. بعد از push: `git ls-remote origin refs/heads/main`

## 10. Production

Production در ساخت این بسته تغییر نکرد. SSH به سرور انجام نشد. `scripts/deploy.sh` علیه Production اجرا نشد.

## 11. Dump دیتابیس

اگر `database/*.dump` هست، از Postgres **محلی** (`localhost`) است نه Production. Restore آن روی سرور Production ممنوع مگر تصمیم آگاهانه و بکاپ جدا.

## 12. Server Info.txt

حاوی IP/پورت/حساب زیرساخت است. فقط داخل ZIP رمزنگاری‌شده جابه‌جا شود.

## شبکه روی سیستم مبدأ (Cursor)

از شِل Cursor، DNS موفق و TCP/HTTPS به GitHub و example.com ناموفق بود. اسکریپت `network-diagnostic.ps1` را **خارج از Cursor** اجرا کنید؛ نتیجهٔ آن در نشست Agent ثبت نشده است.
