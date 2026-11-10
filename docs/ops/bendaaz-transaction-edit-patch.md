# Bendaaz Transaction Edit — deploy when origin + local suite are restored

## Blockers observed 2026-11-09
- Origin `85.208.253.56` unreachable from operator host: TCP **3031 / 22 / 443** all timeout.
- Public `https://parvanerazaghiart.com` WebFetch timed out.
- Local deploy source `C:\Users\milad\AppData\Local\Temp\bendaaz-suite\src` was empty (wiped). Cannot surgically patch live app without restoring source from `/var/www/bendaaz/app`.

## Confirmed architecture (prior live audit)
- App: `/var/www/bendaaz/app` · PM2 `bendaaz-web` · `127.0.0.1:3005` · basePath `/bendaaz-app`
- Schema `Transaction`: `id`, `amount` (Toman Float), `type` INCOME|OUTCOME, `title`, `description?`, `date`, `fileUrl?`, `importHash?`, `categoryId` — **no currency field**
- Existing routes: `GET/POST /api/transactions`, `DELETE /api/transactions/[id]` with `guard` + `isSameOrigin`
- UI: `TransactionList` client component; refresh via parent callback (`onDeleted` / dashboard refetch) — not SWR
- Balance: `getGlobalBalance` = SUM(INCOME) − SUM(OUTCOME); no Wallet row to update

## Target files (on restore)
1. `src/lib/transactions.ts` — add `updateTransaction`
2. `src/app/api/transactions/[id]/route.ts` — add `PATCH`
3. `src/components/edit-transaction-modal.tsx` — new
4. `src/components/transaction-list.tsx` — edit action + modal wiring
5. Optional zod helper if project already uses zod; otherwise keep existing parse style for consistency

## PATCH contract
`PATCH /bendaaz-app/api/transactions/:id`  
JSON body:
```json
{
  "amount": 2500000,
  "type": "OUTCOME",
  "title": "…",
  "description": "…",
  "categoryId": "cuid…",
  "date": "2026-10-15"
}
```
Auth: same `guard(request)` + `isSameOrigin` as DELETE.  
Response: updated DTO JSON. Revalidate by client refetch of transactions + balance endpoints (existing dashboard pattern).

## Apply sequence (when SSH returns)
```bash
# 1) restore local suite from server
scp -P 3031 -r root@ORIGIN:/var/www/bendaaz/app/src ./bendaaz-suite/src
# 2) implement PATCH files
# 3) typecheck + build as parvane
# 4) pm2 reload bendaaz-web
# 5) curl loopback PATCH smoke test
```
