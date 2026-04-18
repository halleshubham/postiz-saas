# Shacky Social

Subscription portal for selling access to your self-hosted [Postiz](https://postiz.com) instance. Users sign up, pick a plan, and get a fully provisioned Postiz workspace — no API tokens, no self-hosting required on their end.

Built on [Wasp](https://wasp.sh) (React + Node.js + Prisma) with Stripe billing.

## Architecture

```
┌─────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  Shacky Social   │       │  SaaS Database   │       │  Postiz Database │
│  (this app)      │──────▶│  (PostgreSQL)    │       │  (PostgreSQL)    │
│                  │       │  Users, Companies│       │  Users, Orgs,    │
│  - Signup/Login  │       │  Subscriptions   │       │  Subscriptions   │
│  - Stripe billing│       └──────────────────┘       └──────────────────┘
│  - Dashboard     │                                         ▲
│  - Legal pages   │─────────────────────────────────────────┘
└─────────────────┘        Direct DB writes on
        │                  signup & payment events
        │
        ▼
┌──────────────────┐
│  Self-hosted     │
│  Postiz instance │
│  app.shackyapps.in│
└──────────────────┘
```

**Two databases:**
- **SaaS DB** (`DATABASE_URL`) — Managed by Wasp/Prisma. Stores portal users, companies, payment state.
- **Postiz DB** (`POSTIZ_DATABASE_URL`) — Your self-hosted Postiz PostgreSQL. This app writes User, Organization, and Subscription rows directly on signup and payment events.

---

## Prerequisites

- **Node.js 20+** (use nvm: `nvm use 20`)
- **Wasp CLI**: `npm i -g @wasp.sh/wasp-cli`
- **PostgreSQL** running locally (or via Docker) for the SaaS database
- **A self-hosted Postiz instance** with its PostgreSQL accessible from this app

---

## Development Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy and edit the env file:

```bash
cp .env.server .env.server.local  # optional: keep a local copy
```

Key variables in `.env.server`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SaaS PostgreSQL connection string |
| `POSTIZ_DATABASE_URL` | Postiz PostgreSQL connection string |
| `POSTIZ_INSTANCE_URL` | URL of your Postiz instance (e.g. `https://app.shackyapps.in`) |
| `SMTP_HOST` | SMTP server (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (e.g. `465`) |
| `SMTP_USERNAME` | SMTP username |
| `SMTP_PASSWORD` | SMTP password / app password |
| `STRIPE_API_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

### 3. Generate the Postiz Prisma client

This project uses a second Prisma client to write directly to the Postiz database. Generate it before starting:

```bash
npx prisma generate --schema=src/postiz-db/schema.prisma
```

### 4. Set up the SaaS database

```bash
# Start the local PostgreSQL (if using docker-compose for dev):
docker compose up db -d

# Run migrations:
wasp db migrate-dev
```

If the DB user lacks `CREATEDB` permission, use `wasp db push` instead.

### 5. Start the app

```bash
wasp start
```

- Client: `http://localhost:3000`
- Server: `http://localhost:3001`

---

## Production Deployment

### 1. Configure production environment

Edit `.env.server.production` with your real values:

```bash
cp .env.server.production.example .env.server.production
vim .env.server.production
```

### 2. Deploy with Docker Compose

```bash
docker compose up -d --build
```

This starts two services:

| Service | Port | Description |
|---------|------|-------------|
| `db` | 5432 (internal) | PostgreSQL 16 for the SaaS database |
| `app` | 3000, 3001 | Wasp app — client (3000) + API server (3001) |

The Docker build installs Wasp CLI, runs `wasp build`, generates the Postiz Prisma client, and uses `wasp build start` to serve both the client SPA and the API server.

### 3. Set the API URL

The `REACT_APP_API_URL` env var in `docker-compose.yml` tells the client where the API lives. Update it for your domain:

```yaml
environment:
  REACT_APP_API_URL: https://your-domain.com
```

### 4. Run database migrations

```bash
docker compose exec app wasp db push
```

---

## Project Structure

```
├── main.wasp                          # App config, routes, operations
├── schema.prisma                      # SaaS database schema
├── Dockerfile                         # Production Docker build
├── docker-compose.yml                 # Production Docker setup
├── .env.server                        # Dev environment variables
├── .env.server.production             # Production environment variables
│
├── src/
│   ├── postiz/
│   │   ├── operations.ts              # getCompanyDashboard, createCompany
│   │   ├── DashboardPage.tsx          # Portal: subscription + "Go to Postiz"
│   │   └── CompanyOnboarding.tsx      # First-time workspace creation
│   │
│   ├── postiz-db/
│   │   ├── schema.prisma              # Postiz DB schema subset
│   │   ├── postizPrismaClient.ts      # Second PrismaClient for Postiz DB
│   │   ├── postizUserService.ts       # Create/delete users, sync subscriptions
│   │   └── postiz-prisma-client.d.ts  # Ambient types for build compatibility
│   │
│   ├── payment/
│   │   ├── user.ts                    # Subscription sync (SaaS + Postiz DB)
│   │   ├── plans.ts                   # Plan definitions (Starter, Growth)
│   │   └── stripe/webhook.ts          # Stripe webhook handler
│   │
│   ├── legal/
│   │   ├── PrivacyPolicyPage.tsx
│   │   └── TermsOfServicePage.tsx
│   │
│   ├── landing-page/
│   │   └── LandingPage.tsx            # Marketing page
│   │
│   ├── auth/                          # Login, signup, password reset
│   ├── user/                          # Account, dropdown menu
│   ├── admin/                         # Admin dashboard
│   └── client/components/             # Shared UI (NavBar, buttons, etc.)
```

---

## Subscription Plans

| Plan | Postiz Tier | Channels | Posts/month | Price |
|------|-------------|----------|-------------|-------|
| Free | (none) | 0 | 0 | Free |
| Starter | STANDARD | 5 | 400 | TBD |
| Growth | PRO | 30 | 1,000,000 | TBD |

When a Stripe payment event fires, the app updates both the SaaS User record and the Postiz Subscription table.

---

## Useful Commands

```bash
# Start dev server
wasp start

# Generate Postiz Prisma client
npx prisma generate --schema=src/postiz-db/schema.prisma

# Run SaaS DB migrations
wasp db migrate-dev

# Push schema without migrations (no CREATEDB needed)
wasp db push

# Build for production
wasp build

# Production Docker
docker compose up -d --build
docker compose logs -f
docker compose down
```
