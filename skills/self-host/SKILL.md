---
name: self-host
description: Use this skill when the user wants to run their own RevenueDot server with Docker and Postgres, create the first account, connect an AI assistant and App Store and Google Play notifications, or back up and upgrade a self-hosted RevenueDot.
license: MIT
---

# Self-host RevenueDot with Docker

One container serves the SDK API (`/v1`), the REST API (`/v2`), store notifications (`/v1/notifications/...`) and the dashboard on port 8787, next to a Postgres 16 container. There is no published image yet, so Compose builds it from source (the first build takes a few minutes).

RevenueDot is not affiliated with RevenueCat, Inc.

## Rules for the agent

- **Never read, ask for, print or commit a secret.** That covers the Postgres password, secret API keys, the signing key and store credentials. The developer sets them in their own terminal, in `.env` or in the dashboard. Do not open `.env` after the developer has filled it in.
- **Use the RevenueDot MCP tools for RevenueDot steps** once phase 4 has connected them. They sign in with OAuth against the developer's own server.
- `POSTGRES_PASSWORD` must be set before the first start. Postgres stores it in the volume on first start; changing it later needs `ALTER USER` in Postgres too.
- Run one `revenuedot` container per database. The container runs a background job every 30 seconds (expirations, webhook sends), and two containers would both run it.
- Run the check after each phase.

## Phase 1: Start the server

Needs Docker with Compose v2, `git`, `curl` and `jq`.

```bash
git clone https://github.com/revenuedot/examples.git
cd examples/selfhost/docker-compose
cp .env.example .env
```

The developer opens `.env` and replaces `change-me` in `POSTGRES_PASSWORD` with a long random value. Then:

```bash
docker compose up -d            # builds the image from https://github.com/revenuedot/revenuedot.git#main
```

Settings in `.env`:

| Variable | Default | What it does |
|---|---|---|
| `POSTGRES_PASSWORD` | none, required | Password of the bundled Postgres |
| `REVENUEDOT_PORT` | `8787` | Host port for the API and the dashboard |
| `REVENUEDOT_SOURCE` | `https://github.com/revenuedot/revenuedot.git#main` | Where the image is built from; can be a local checkout |

Inside the container the server reads:

| Variable | Default | What it does |
|---|---|---|
| `DATABASE_URL` | set by Compose to the bundled Postgres | Postgres connection string. Point it at a managed Postgres to use one. Without it the server falls back to an embedded dev database (`pglite://./.data/dev`), which is not for production |
| `PORT` | `8787` | Port the server listens on |
| `DASHBOARD_DIST` | `/app/apps/dashboard/dist` (set in the Dockerfile) | Folder of the built dashboard. If it has no `index.html`, only the API runs |
| `REVENUEDOT_SIGNING_KEY` | unset (signing off) | Optional. Base64 Ed25519 seed for signed SDK responses. See phase 6 |

App Store and Google Play credentials are not environment variables. They belong to each app (phase 5).

The `revenuedot/revenuedot` monorepo also has a `docker-compose.yml` at its root that builds from the checkout (`build: .`). Its Postgres password falls back to `revenuedot` when it is unset, so always set it there too.

**Check:**
```bash
curl http://localhost:8787/v1/health     # {"status":"ok"}
docker compose logs revenuedot | tail    # "RevenueDot API on http://localhost:8787"
```
Database migrations run on every start, before the server listens.

## Phase 2: Put it on a public HTTPS host

The stores and phones must reach the server over HTTPS.

1. Put a reverse proxy (Caddy, nginx, a load balancer) in front of port 8787, **at the root of a host** such as `https://revenuedot.example.com`. The SDKs drop any path in the proxy URL, so `https://example.com/revenuedot` does not work.
2. Pass `X-Forwarded-Host` and `X-Forwarded-Proto` through. RevenueDot builds the notification URLs it shows from them.

**Check:** `curl https://revenuedot.example.com/v1/health` returns `{"status":"ok"}`.

## Phase 3: Create the first account and project

1. The developer opens `https://revenuedot.example.com/signup` and creates an account. Sign-up creates the account and its first project. The dashboard is at `/login`; the bare `/` returns a small JSON document.
2. For a local trial instead, `seed.sh` in the same folder signs up a development account and adds a Test Store app, a `pro` entitlement and a `default` offering. The developer runs `./seed.sh` (it reads `RD_URL`, `RD_EMAIL` and `RD_PASSWORD` when set).

Tell the user: sign-up is open to anyone who can reach the server. A new account only sees its own project, but restrict `/signup` and `/auth/signup` at the reverse proxy after the first account if they do not want strangers creating accounts.

**Check:** the dashboard opens on the new project.

## Phase 4: Connect an AI assistant

The RevenueDot MCP server works against a self-hosted server too, and the server itself is the OAuth sign-in. The developer runs it in a terminal of their own:

```bash
npx -y @revenuedot/mcp --http --port 8788 --url https://revenuedot.example.com
```

Then connects the assistant to `http://127.0.0.1:8788/mcp`. In Claude Code: `claude mcp add --transport http revenuedot http://127.0.0.1:8788/mcp`. Connecting opens the server's own sign-in page, where the developer picks the project and **read and change** access. No key is copied anywhere: the access token is a project key the server lists under **API keys** as `OAuth: <client name>`, and revoking it there ends the connection.

To serve it to a team, put it behind the reverse proxy with `--host 0.0.0.0 --public-url https://mcp.your-domain`.

Backends that call the REST API need their own secret key: the developer creates it in the dashboard under **API keys** (`/projects/<project_id>/api-keys`). It is shown once. `permissions` limit what it can do; without them the key has full access to the project. The key goes in the backend's secret settings, never into the chat or a committed file.

**Check:** `list-projects` returns the project.

## Phase 5: Connect the stores

Create an app per store with `create-app`: `type: "app_store"` with `bundle_id`, or `type: "play_store"` with `package_name` (or in the dashboard under **Apps**). Then, per app:

1. **Credentials.** The developer enters them in the dashboard (Apps > the app):
   - App Store: **In-app purchase key**, the In-App Purchase key from App Store Connect (.p8 file, key ID, issuer ID).
   - Google Play: **Service account credentials**, the JSON of a service account with the "View financial data" permission.
   Then call `verify-store-credentials` with the `app_id`. It returns `"status":"valid"` when Apple or Google accept them.
2. **Notification URLs.** `get-app-store-settings` with the `app_id` returns the exact `notification_url`, and `api_origin`, which is the SDK's proxy URL.
   - App Store: the URL has the form `https://revenuedot.example.com/v1/notifications/apple/<app_id>`. Paste it into App Store Connect > App Information > App Store Server Notifications, for Production and Sandbox.
   - Google Play: the URL has the form `https://revenuedot.example.com/v1/notifications/google/<app_id>`. In Google Cloud > Pub/Sub, open the topic set in Play Console > Monetization setup and add a **push** subscription to this URL.

**Check:** `get-project-health` shows, per app, `credentials_configured: true` and a `notification_status`. It is `waiting` until the first notification, `received` or `ready` after it, and `failing` with `last_notification_error` when a notification was rejected.

## Phase 6: Response signing (optional)

The RevenueCat SDKs check response signatures against RevenueCat's key, which RevenueDot does not have. Apps using those SDKs must turn verification off (see the `add-subscriptions` skill), and `REVENUEDOT_SIGNING_KEY` is not needed.

Set it only for SDK builds that pin this server's own public key. The developer does these steps in their own terminal, because the output is a private key:
1. In a checkout of the `revenuedot/revenuedot` repository, run `pnpm install && pnpm tsx scripts/signing-keygen.ts`. It prints the private seed as a `REVENUEDOT_SIGNING_KEY=...` line, and the public key.
2. Add `REVENUEDOT_SIGNING_KEY: ${REVENUEDOT_SIGNING_KEY}` under `environment:` of the `revenuedot` service in `docker-compose.yml`, paste the printed line into `.env`, and run `docker compose up -d`.

**Check:** the server's `/.well-known/revenuedot-signing-key` path returns the `public_key` (for example `curl https://revenuedot.example.com/.well-known/revenuedot-signing-key`). Without the key it answers 404.

## Phase 7: Back up, restore, upgrade

Run these in the Compose folder.

```bash
# Back up (compressed custom-format dump). Schedule it daily and copy it off the machine.
docker compose exec -T db pg_dump -U revenuedot -Fc revenuedot > revenuedot-$(date +%F).dump

# Restore: stop the API, restore, start it again
docker compose stop revenuedot
docker compose exec -T db pg_restore -U revenuedot -d revenuedot --clean --if-exists < revenuedot-2026-09-30.dump
docker compose start revenuedot

# Upgrade: back up first, then rebuild from the latest source. Migrations run on start.
docker compose build --pull revenuedot && docker compose up -d
```

`docker compose down -v` deletes the database volume, with every customer and purchase. Never run it on a real server unless the user asks for a clean start.

**Check:** after a restore or an upgrade, `/v1/health` returns `{"status":"ok"}` and `get-project-health` still lists the apps.
