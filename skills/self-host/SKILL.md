---
name: self-host
description: Use this skill when the user wants to run their own RevenueDot server with Docker and Postgres, create the first account and secret key, connect App Store and Google Play notifications, or back up and upgrade a self-hosted RevenueDot.
license: MIT
---

# Self-host RevenueDot with Docker

One container serves the SDK API (`/v1`), the REST API (`/v2`), store notifications (`/v1/notifications/...`) and the dashboard on port 8787, next to a Postgres 16 container. There is no published image yet, so Compose builds it from source (the first build takes a few minutes).

RevenueDot is not affiliated with RevenueCat, Inc.

## Rules for the agent

- **Never commit `.env`, secret keys (`sk_...`) or store credentials.**
- Set `POSTGRES_PASSWORD` before the first start. Postgres stores it in the volume on first start; changing it later needs `ALTER USER` in Postgres too.
- Run one `revenuedot` container per database. The container runs a background job every 30 seconds (expirations, webhook sends), and two containers would both run it.
- Run the check after each phase.

## Phase 1: Start the server

Needs Docker with Compose v2, `git`, `curl` and `jq`.

```bash
git clone https://github.com/revenuedot/examples.git
cd examples/selfhost/docker-compose
cp .env.example .env            # then set POSTGRES_PASSWORD to a long random value
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

The monorepo also has a `docker-compose.yml` at the root of https://github.com/revenuedot/revenuedot that builds from the checkout (`build: .`). Its Postgres password falls back to `revenuedot` when `POSTGRES_PASSWORD` is unset, so always set it there.

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

1. Open `https://revenuedot.example.com/signup` and create an account. Sign-up creates the account and its first project. The dashboard is at `/login`; the bare `/` returns a small JSON document.
2. From a script instead:
   ```bash
   curl -s -c cookies.txt -X POST https://revenuedot.example.com/auth/signup -H 'content-type: application/json' \
     -d '{"email":"you@example.com","password":"at-least-8-characters","project_name":"My app"}'
   ```
   It returns `{"ok":true}` with status 201 and a session cookie.

Tell the user: sign-up is open to anyone who can reach the server. A new account only sees its own project, but restrict `/signup` and `/auth/signup` at the reverse proxy after the first account if they do not want strangers creating accounts.

For a local trial, `seed.sh` in the same folder does phases 3 and 4 and adds a Test Store app, a `pro` entitlement and a `default` offering: `./seed.sh` (or `RD_URL=... RD_EMAIL=... RD_PASSWORD=... ./seed.sh`).

**Check:** `curl -s -b cookies.txt https://revenuedot.example.com/auth/me` lists the user and `projects[0].id`.

## Phase 4: Create a secret key

1. Dashboard: **API keys** page (`/projects/<project_id>/api-keys`), create a secret key. It is shown once.
2. From a script, with the session cookie from phase 3:
   ```bash
   PROJECT=$(curl -s -b cookies.txt https://revenuedot.example.com/auth/me | jq -r '.projects[0].id')
   curl -s -b cookies.txt -X POST "https://revenuedot.example.com/v2/projects/$PROJECT/api_keys" \
     -H 'content-type: application/json' -d '{"name":"backend"}' | jq -r .key
   ```
   `permissions` is optional; without it the key has full access to the project.

**Check:** `curl -s -H "Authorization: Bearer sk_..." https://revenuedot.example.com/v2/projects` returns the project.

To manage the server from an agent, connect the MCP server to it:
```bash
claude mcp add revenuedot -e REVENUEDOT_API_KEY=sk_... -e REVENUEDOT_URL=https://revenuedot.example.com -- npx -y @revenuedot/mcp
```
Or serve it over HTTP yourself: `npx -y @revenuedot/mcp --http --port 8788 --url https://revenuedot.example.com`.

## Phase 5: Connect the stores

Create an app per store (dashboard **Apps**, or `POST /v2/projects/<project_id>/apps` with `{"name":"...","type":"app_store","app_store":{"bundle_id":"..."}}`; for Android `"type":"play_store","play_store":{"package_name":"..."}`). Then, per app:

1. **Credentials**, in the dashboard (Apps > the app) or with `POST /v2/projects/<project_id>/apps/<app_id>`:
   - App Store: `{"app_store":{"subscription_private_key":"<.p8 contents>","subscription_key_id":"...","subscription_key_issuer":"..."}}` (the In-App Purchase key from App Store Connect).
   - Google Play: `{"play_store":{"play_service_account_credentials_json":"<JSON>"}}` (a service account with the "View financial data" permission).
   Check them: `POST /v2/projects/<project_id>/apps/<app_id>/actions/verify_credentials` with `{}` returns `"status":"valid"`.
2. **Notification URLs:**
   - App Store: `https://revenuedot.example.com/v1/notifications/apple/<app_id>`. Paste it into App Store Connect > App Information > App Store Server Notifications, for Production and Sandbox.
   - Google Play: `https://revenuedot.example.com/v1/notifications/google/<app_id>`. In Google Cloud > Pub/Sub, open the topic set in Play Console > Monetization setup and add a **push** subscription to this URL.
   `GET /v2/projects/<project_id>/apps/<app_id>/store_settings` returns the exact `notification_url` and the `api_origin` to use as the SDK's proxy URL.

**Check:** `GET /v2/projects/<project_id>/setup_health` shows, per app, `credentials_configured: true` and a `notification_status`. It is `waiting` until the first notification, `received` or `ready` after it, and `failing` with `last_notification_error` when a notification was rejected.

## Phase 6: Response signing (optional)

The RevenueCat SDKs check response signatures against RevenueCat's key, which RevenueDot does not have. Apps using those SDKs must turn verification off (see the `add-subscriptions` skill), and `REVENUEDOT_SIGNING_KEY` is not needed.

Set it only for SDK builds that pin this server's own public key:
1. From a checkout of https://github.com/revenuedot/revenuedot: `pnpm install && pnpm tsx scripts/signing-keygen.ts`. It prints `REVENUEDOT_SIGNING_KEY=...` and the public key.
2. Add `REVENUEDOT_SIGNING_KEY: ${REVENUEDOT_SIGNING_KEY}` under `environment:` of the `revenuedot` service, put the value in `.env`, and run `docker compose up -d`.

**Check:** `curl https://revenuedot.example.com/.well-known/revenuedot-signing-key` returns the `public_key`. Without the key it answers 404.

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

**Check:** after a restore or an upgrade, `/v1/health` returns `{"status":"ok"}` and `setup_health` still lists the apps.
