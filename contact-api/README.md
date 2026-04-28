# Fakukac Contact API

Vercel serverless function ami a Fakukac landing page kapcsolat-űrlapját kezeli.
Bejövő POST → email Tibinek a Resend API-n keresztül.

## Endpoint

`POST /api/contact`

### Body (JSON)

```json
{
  "name": "Kovács Pista",
  "email": "pista@pelda.hu",
  "phone": "+36 30 123 4567",
  "msg": "3x4 m előtetőt szeretnék Veszprémbe...",
  "quote": "85.000 – 120.000 Ft (2 m × 3 m előtető, Veszprém)"
}
```

`name` és `email` kötelező, a többi opcionális.

## Environment variables

A Vercel project Settings → Environment Variables alatt kell beállítani:

| Név | Kötelező | Default | Leírás |
|---|---|---|---|
| `RESEND_API_KEY` | igen | — | Resend dashboard → API Keys → Create |
| `FROM_EMAIL` | nem | `onboarding@resend.dev` | Resend sandbox sender, működik domain verifikáció nélkül |
| `TO_EMAIL` | nem | `tibor.fakukac@gmail.com` | Tibi főcím |
| `CC_EMAIL` | nem | `zsoltipi@gmail.com` | Másolat magadnak |

## Deploy

1. `vercel.com` → New Project → Import a `fakukac` repo `contact-api/` mappáját (root direcory: `contact-api`)
2. Env vars beállítása (legalább `RESEND_API_KEY`)
3. Deploy
4. Teszt: `curl -X POST https://YOUR-URL.vercel.app/api/contact -H "Content-Type: application/json" -d '{"name":"Teszt","email":"teszt@pelda.hu","msg":"teszt üzenet"}'`

## Local dev

```
cd contact-api
npx vercel dev
```
