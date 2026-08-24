# راهنمای بازیابی شبکه (بدون دور زدن امنیت)

این راهنما برای انتقال کد به سیستم دوم است. Production را تغییر ندهید. VPN را خودتان و فقط در صورت اعتماد نصب/فعال کنید.

## ترتیب امن

1. **این اسکریپت را خارج از Cursor اجرا کنید** (Windows Terminal یا PowerShell معمولی، نه شِل Agent):

```powershell
Set-ExecutionPolicy -Scope Process Bypass
cd C:\Users\a.hosseini\Desktop\apk\parvanerazaghiart\versions\v.1.0.0
.\network-diagnostic.ps1
```

خروجی باید یکی از این‌ها باشد:

- `OUTSIDE_CURSOR_NETWORK_OK`
- `OUTSIDE_CURSOR_NETWORK_BLOCKED`
- `PARTIAL_CONNECTIVITY`

2. **اگر OK شد:** Git را از همان ترمینال خارجی انجام دهید. Cursor ممکن است TCP خروجی را جداگانه محدود کند.

3. **اگر BLOCKED یا PARTIAL ماند:** به‌ترتیب و بدون خاموش‌کردن کورکورانه امنیت بررسی کنید:

   - Windows Firewall (قواعد outbound برای `curl.exe`، `git.exe`، `ssh.exe`)
   - آنتی‌ویروس / endpoint protection
   - VPN kill-switch وقتی تونل قطع است
   - سیاست proxy سازمانی (فقط وجود/عدم وجود؛ مقدار را در چت نگذارید)

4. **کنترل امنیتی را بی‌دلیل خاموش نکنید.** اگر قاعده outbound لازم است، فقط برای GitHub/HTTPS و به‌صورت محدود اضافه کنید.

5. **اگر VPN معتبر سازمانی/شخصی دارید:** آن را دستی روشن کنید، دوباره `network-diagnostic.ps1` را اجرا کنید، بعد `git ls-remote` بزنید.

6. **اگر شبکه همچنان بسته است:** از بستهٔ انتقال همین پوشه استفاده کنید. فایل حساس را فقط به‌صورت ZIP رمزنگاری‌شده AES-256 جابه‌جا کنید (`create-sensitive-archive.ps1`).

## گزینه‌های Git (remote را خودکار عوض نکنید)

مستندات کامل در `TRANSFER_README.fa.md` است.

- OPTION 1: HTTPS + Git Credential Manager + توکن با حداقل دسترسی (توکن در URL نباشد).
- OPTION 2: SSH روی پورت 443 به `ssh.github.com` — فقط با ویرایش دستی `~/.ssh/config`.
- OPTION 3: VPN معتبر — نصب خودکار نشود.

Push فقط پس از مجوز صریح:

```text
git push -u origin main
```

Force-push ممنوع است.
