---
type: llm
---

Facts about self-hosting RevenueDot: there is no published Docker image yet; you clone https://github.com/revenuedot/examples, go to `selfhost/docker-compose`, copy `.env.example` to `.env`, set `POSTGRES_PASSWORD` yourself, and run `docker compose up -d`, which builds the image from source next to Postgres 16. The server listens on port 8787, `/v1/health` answers `{"status":"ok"}`, and it must sit behind an HTTPS reverse proxy at the root of a host, because the SDKs drop any path in the proxy URL. Judge the assistant's final answer.

PASS only if all of these hold:
1. It uses the Compose setup from the revenuedot/examples repository (or the monorepo's docker-compose.yml) and builds from source, rather than pulling an invented image name.
2. It has the user set `POSTGRES_PASSWORD` in `.env` themselves before the first start.
3. It checks the server with `/v1/health`.
4. It puts the server behind HTTPS at the root of a host or subdomain, not under a sub-path.

FAIL if any item is missing, if it invents a published image such as `docker pull revenuedot/...` or `ghcr.io/revenuedot/...`, or if it asks the user to paste a password or secret key into the chat.
