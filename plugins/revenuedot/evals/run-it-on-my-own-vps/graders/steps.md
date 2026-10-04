---
type: llm
---

Facts about self-hosting RevenueDot: the published image is `ghcr.io/revenuedot/revenuedot` (tagged `latest`, by date such as `2026.10.03`, and by commit; `docker pull` needs no account). You clone the revenuedot/examples repository from GitHub, go to `selfhost/docker-compose`, copy `.env.example` to `.env`, set `POSTGRES_PASSWORD` yourself, generate `REVENUEDOT_ENCRYPTION_KEY` yourself with `openssl rand -base64 32` and paste it into `.env`, and run `docker compose up -d`, which pulls the image and starts it next to Postgres 16. For production you pin a date or commit tag with `REVENUEDOT_IMAGE` in `.env`, and you upgrade with `docker compose pull && docker compose up -d`. Building from source (`docker compose build`) is only for running your own changes. The server listens on port 8787, `/v1/health` answers `{"status":"ok"}`, and it must sit behind an HTTPS reverse proxy at the root of a host, because the SDKs drop any path in the proxy URL. Judge the assistant's final answer.

PASS only if all of these hold:
1. It uses the Compose setup from the revenuedot/examples repository (or the monorepo's docker-compose.yml) and pulls the published image `ghcr.io/revenuedot/revenuedot`, rather than an invented image name (such as a Docker Hub `revenuedot/...` image) or a mandatory build from source.
2. It has the user set `POSTGRES_PASSWORD` and `REVENUEDOT_ENCRYPTION_KEY` in `.env` themselves before the first start, without the assistant generating or seeing the key.
3. It checks the server with `/v1/health`.
4. It puts the server behind HTTPS at the root of a host or subdomain, not under a sub-path.

FAIL if any item is missing, if it invents an image that is not `ghcr.io/revenuedot/revenuedot`, or if it asks the user to paste a password or secret key into the chat.
