---
name: self-host
description: Use this skill when the user wants to run their own RevenueDot server with Docker and Postgres, create the first account, connect an AI assistant and App Store and Google Play notifications, or back up and upgrade a self-hosted RevenueDot.
license: MIT
---

# Self-host RevenueDot with Docker

One container serves the SDK API (`/v1`), the REST API (`/v2`), store notifications (`/v1/notifications/...`) and the dashboard on port 8787, next to a Postgres 16 container. Compose pulls the published image `ghcr.io/revenuedot/revenuedot` (linux/amd64 and linux/arm64, built on every change to `main` and tagged `latest`, by date such as `2026.10.03`, and by commit); `docker pull ghcr.io/revenuedot/revenuedot:latest` needs no account. Building from source stays available for running your own changes (phase 7).

RevenueDot is not affiliated with RevenueCat, Inc.

## Rules for the agent

- **Never read, ask for, print, generate or commit a secret.** That covers the Postgres password, the encryption key, the SMTP password, secret API keys, the signing key and store credentials. Do not run the key generation commands yourself, because their output would land in the chat. The developer sets them in their own terminal, in `.env` or in the dashboard. Do not open `.env` after the developer has filled it in.
- **Use the RevenueDot MCP tools for RevenueDot steps** once phase 4 has connected them. They sign in with OAuth against the developer's own server.
- **If the user pastes a key into the chat anyway,** do not repeat any part of it (not even the key ID or issuer ID), store it or pass it to a tool, and do not tell them to upload that key. Tell them it is now exposed, in this order: revoke it (an App Store key in App Store Connect > Users and Access > Integrations, a Google service account key in the Google Cloud console, a RevenueDot or RevenueCat secret key on that dashboard's API keys page), create a new one, and enter only the new one in the RevenueDot dashboard (Apps, then the app, for store keys).
- `POSTGRES_PASSWORD` and `REVENUEDOT_ENCRYPTION_KEY` must be set before the first start. Postgres stores the password in the volume on first start, so changing it later needs `ALTER USER` in Postgres too. Changing the encryption key later means entering the integrations' keys again.
- Run one `revenuedot` container per database. The container runs a background job every 30 seconds (expirations, webhook sends), and two containers would both run it.
- Run the check after each phase.

## Phase 1: Start the server

Needs Docker with Compose v2, `git`, `curl` and `jq`.

```bash
git clone https://github.com/revenuedot/examples.git
cd examples/selfhost/docker-compose
cp .env.example .env
```

The developer fills in `.env` in their own editor and terminal. The assistant never opens it.
1. Replace `change-me` in `POSTGRES_PASSWORD` with a long random value.
2. **Required before the first start:** run `openssl rand -base64 32` in their own terminal and paste the output after `REVENUEDOT_ENCRYPTION_KEY=`. The key seals the API keys and tokens of integrations and data exports (Slack, Segment, Amplitude, S3 and others). Without it, and without a signing key (phase 6), the server stores those credentials unencrypted. Keep a copy with the backups (phase 7): a changed or lost key means entering those integrations' keys again.
3. To confirm the key is there without showing it, the developer runs `grep -c '^REVENUEDOT_ENCRYPTION_KEY=.' .env`, which prints `1`.

Then:

```bash
docker compose up -d            # pulls ghcr.io/revenuedot/revenuedot:latest and starts it next to Postgres
```

For production, the developer pins a date or commit tag in `.env` (`REVENUEDOT_IMAGE=ghcr.io/revenuedot/revenuedot:2026.10.03`) so a restart never picks up a build they have not tested. The tags are listed at https://github.com/revenuedot/revenuedot/pkgs/container/revenuedot.

Settings in `.env`:

| Variable | Default | What it does |
|---|---|---|
| `POSTGRES_PASSWORD` | none, required | Password of the bundled Postgres |
| `REVENUEDOT_PORT` | `8787` | Host port for the API and the dashboard |
| `REVENUEDOT_IMAGE` | `ghcr.io/revenuedot/revenuedot:latest` | The server image, pulled when missing. Pin a date or commit tag for production |
| `REVENUEDOT_SOURCE` | `https://github.com/revenuedot/revenuedot.git#main` | Where `docker compose build` builds the image from instead of pulling it; can be a local checkout. See phase 7 |
| `REVENUEDOT_ENCRYPTION_KEY` | empty | Required by this guide. Base64 of 32 random bytes that seals integration and data export credentials. Empty falls back to a key derived from the signing key; with neither, they are stored unencrypted |
| `REVENUEDOT_PUBLIC_URL` | empty (the address each request came in on) | The public address of the dashboard, used for links in emails. See phase 2 |
| `REVENUEDOT_ALLOW_SIGNUP` | `false` | Only the first account (the owner) can sign up. `true` lets anyone who can reach the dashboard create an account. See phase 3 |
| `REVENUEDOT_SMTP_URL` | empty (emails go to the server log) | SMTP server for password resets, invites, verification links and alerts. See phase 3 |
| `REVENUEDOT_MAIL_FROM` | `RevenueDot <no-reply@localhost>` | Sender of those emails |
| `REVENUEDOT_MAIL_REPLY_TO` | empty | Reply-to address of those emails |
| `REVENUEDOT_SIGNING_KEY` | empty (signing off) | Optional. Base64 Ed25519 seed for signed SDK responses. See phase 6 |

Compose passes every `REVENUEDOT_*` setting except `REVENUEDOT_PORT`, `REVENUEDOT_IMAGE` and `REVENUEDOT_SOURCE` from `.env` to the server, plus the optional settings the monorepo's own compose file passes (web billing, AI features, the AdMob OAuth client, export archives), all off or at their default when unset; the self-hosting guide's settings table describes them.

Inside the container the server reads:

| Variable | Default | What it does |
|---|---|---|
| `DATABASE_URL` | set by Compose to the bundled Postgres | Postgres connection string. Point it at a managed Postgres to use one. Without it the server falls back to an embedded dev database (`pglite://./.data/dev`), which is not for production |
| `PORT` | `8787` | Port the server listens on |
| `DASHBOARD_DIST` | `/app/apps/dashboard/dist` (set in the Dockerfile) | Folder of the built dashboard. If it has no `index.html`, only the API runs |

App Store and Google Play credentials are not environment variables. They belong to each app (phase 5).

The `revenuedot/revenuedot` monorepo also has a `docker-compose.yml` at its root that pulls the same image, with `build: .` as the build-from-source fallback. Its Postgres password falls back to `revenuedot` when it is unset, so always set it there too.

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
3. Set `REVENUEDOT_PUBLIC_URL=https://revenuedot.example.com` in `.env` and run `docker compose up -d`, so links in emails point at the public host.

**Check:** `curl https://revenuedot.example.com/v1/health` returns `{"status":"ok"}`.

## Phase 3: Create the first account and project

1. The developer opens `https://revenuedot.example.com/signup` and creates an account. Sign-up creates the account and its first project. The dashboard is at `/login`; the bare `/` returns a small JSON document.
2. For a local trial instead, `seed.sh` in the same folder signs up a development account and adds a Test Store app, a `pro` entitlement and a `default` offering. The developer runs `./seed.sh` (it reads `RD_URL`, `RD_EMAIL` and `RD_PASSWORD` when set).

Sign-up closes after this first account: the server lets only its owner sign up while `REVENUEDOT_ALLOW_SIGNUP` is `false`, the default. Leave it that way and invite teammates to the project instead. Set it to `true` only if anyone who can reach the dashboard may create an account.

Email: without `REVENUEDOT_SMTP_URL` the server sends nothing and prints every email, including password reset and invite links, to `docker compose logs revenuedot`. For a real server, the developer puts their SMTP provider's address in `REVENUEDOT_SMTP_URL` in `.env` (`smtp://` for STARTTLS on port 587, `smtps://` for TLS on port 465, special characters in the user or password URL-encoded), sets `REVENUEDOT_MAIL_FROM` to the sender, and runs `docker compose up -d`. The server log then says "Email: SMTP".

**Check:** the dashboard opens on the new project.

## Phase 4: Connect an AI assistant

The RevenueDot MCP server works against a self-hosted server too, and the server itself is the OAuth sign-in. The developer runs it in a terminal of their own:

```bash
npx -y @revenuedot/mcp@0.2.0 --http --port 8788 --url https://revenuedot.example.com
```

Then connects the assistant to `http://127.0.0.1:8788/mcp`. In Claude Code: `claude mcp add --transport http revenuedot http://127.0.0.1:8788/mcp`. Connecting opens the server's own sign-in page, where the developer picks the project and **read and change** access. No key is copied anywhere: the access token is a project key the server lists under **API keys** as `OAuth: <client name>`, and revoking it there ends the connection.

To serve it to a team, put it behind the reverse proxy with `--host 0.0.0.0 --public-url https://mcp.your-domain`.

Version 0.2.0 of the local server has the same 38 tools as the hosted one.

Backends that call the REST API need their own secret key: the developer creates it in the dashboard under **API keys** (`/projects/<project_id>/api-keys`). It is shown once. `permissions` limit what it can do; without them the key has full access to the project. The key goes in the backend's secret settings, never into the chat or a committed file.

**Check:** `list-projects` returns the project.

## Phase 5: Connect the stores

Create an app per store: `create-app` with `type: "app_store"` and `bundle_id`, or `type: "play_store"` and `package_name`. Without that tool, the developer adds it in the dashboard under **Apps**. Then, per app:

1. **Credentials.** The developer enters them in the dashboard (Apps > the app):
   - App Store: **In-app purchase key**, the In-App Purchase key from App Store Connect (.p8 file, key ID, issuer ID).
   - Google Play: **Service account credentials**, the JSON of a service account with the "View financial data" permission.
   Then call `verify-store-credentials` with the `app_id`, or the developer clicks **Check credentials** on the same page. It answers `valid` when Apple or Google accept them.
2. **Notification URLs.** `get-app-store-settings` with the `app_id` returns the exact `notification_url`, and `api_origin`, which the app sets as the RevenueDot SDK's proxy URL before `configure` (the `add-subscriptions` skill shows the line per platform). The app's dashboard page shows the same URL with a copy button.
   - App Store: the URL has the form `https://revenuedot.example.com/v1/notifications/apple/<app_id>`. Paste it into App Store Connect > App Information > App Store Server Notifications, for Production and Sandbox.
   - Google Play: the URL has the form `https://revenuedot.example.com/v1/notifications/google/<app_id>`. In Google Cloud > Pub/Sub, open the topic set in Play Console > Monetization setup and add a **push** subscription to this URL.

**Check:** `get-project-health` shows, per app, `credentials_configured: true` and a `notification_status`. It is `waiting` until the first notification, `received` or `ready` after it, and `failing` with `last_notification_error` when a notification was rejected. Without that tool, the app's **Setup checklist** in the dashboard shows whether the key is saved and when notifications last arrived.

## Phase 6: Response signing (optional)

The RevenueDot SDK trusts only RevenueDot Cloud's response-signing key, and an app that still ships the RevenueCat SDK trusts only RevenueCat's. So apps that talk to a self-hosted server keep entitlement verification disabled (see the `add-subscriptions` skill), and `REVENUEDOT_SIGNING_KEY` is not needed.

Set it only for SDK builds that pin this server's own public key (see https://revenuedot.app/docs/guides/trusted-entitlements). The developer does these steps in their own terminal, because the output is a private key:
1. In a checkout of the `revenuedot/revenuedot` repository, run `pnpm install && pnpm tsx scripts/signing-keygen.ts`. It prints the private seed as a `REVENUEDOT_SIGNING_KEY=...` line, and the public key.
2. Paste the printed `REVENUEDOT_SIGNING_KEY=...` line into `.env` (`.env.example` has it commented out), then run `docker compose up -d`. The compose file in `selfhost/docker-compose` already passes this variable from `.env` to the server, so nothing in `docker-compose.yml` changes.

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

# Upgrade: back up first, then pull the new image and restart. Migrations run on start.
docker compose pull && docker compose up -d
```

With `REVENUEDOT_IMAGE` pinned to a date or commit tag, an upgrade is: back up, change the tag in `.env`, `docker compose up -d`. If the new build fails to start (`docker compose logs revenuedot --tail 100` names the failed migration), the developer sets the tag that worked in `.env` and runs `docker compose up -d` again.

To run their own changes instead of the published image, the developer builds from source: set `REVENUEDOT_SOURCE` in `.env` to a local checkout (the default builds GitHub `main`) and `REVENUEDOT_IMAGE` to a name of their own such as `revenuedot:local`, so a later `docker compose pull` does not replace the build, then run `docker compose build && docker compose up -d` (the first build takes a few minutes; `docker compose build --pull && docker compose up -d` rebuilds after each change).

Back up `.env` too, stored apart from the dumps: it holds `REVENUEDOT_ENCRYPTION_KEY`, and a restored database without that key cannot open the integrations' credentials.

`docker compose down -v` deletes the database volume, with every customer and purchase. Never run it on a real server unless the user asks for a clean start.

**Check:** after a restore or an upgrade, `/v1/health` returns `{"status":"ok"}` and `list-apps` still lists the apps.
