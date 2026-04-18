# Shacky Social

Company-focused SaaS for selling access to your self-hosted Postiz instance.

This app is based on `wasp-lang/open-saas` and is intentionally scoped to company customers, not resellers.

## What This App Does

- Companies sign up and create one company workspace.
- Company admins save a Postiz API token or use the server fallback key.
- Companies sync social accounts already connected in Postiz.
- Company users compose and schedule posts through your Postiz instance.
- Starter/Growth subscription plans control seats, accounts, and monthly scheduled posts.
- Open SaaS still provides auth, Stripe-ready billing, admin dashboard, email auth, and Wasp/Prisma wiring.

## Local Database

The local database URL is:

```text
postgresql://postiz_saas:postiz_saas@localhost:5432/postiz_saas
```

## Commands

Use nvm:

```bash
source ~/.nvm/nvm.sh
nvm use 20.19.3
```

Install dependencies:

```bash
npm install --registry=https://registry.npmjs.org/
```

Install Wasp CLI if missing:

```bash
npm i -g @wasp.sh/wasp-cli --registry=https://registry.npmjs.org/
```

Run migrations:

```bash
wasp db migrate-dev
```

Start the app:

```bash
wasp start
```

## Important Files

- `main.wasp` - routes, auth, operations, entities
- `schema.prisma` - users, companies, Postiz integrations, scheduled posts
- `src/postiz/operations.ts` - company workspace, token storage, sync, scheduling
- `src/postiz/*Page.tsx` - dashboard, composer, integrations, settings
- `.env.server` - local DB/Postiz/payment env

## Postiz Notes

Set `POSTIZ_BASE_URL=https://app.shackyapps.in/public/v1`.

Companies can save a Postiz API token in `/company/settings`. If a company has no saved token, the server uses `POSTIZ_ADMIN_API_KEY` as a fallback.
