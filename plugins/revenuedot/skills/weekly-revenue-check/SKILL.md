---
name: weekly-revenue-check
description: Use this skill when the user wants a quick health and revenue check of their RevenueDot project. It covers store connections, failed webhooks, billing problems and the key revenue numbers, summarised in a few lines. It needs the RevenueDot MCP server connected.
license: MIT
---

# Weekly revenue check

RevenueDot is an open-source backend for in-app purchases that speaks RevenueCat's API. This skill reads a project with the RevenueDot MCP tools and reports in plain words. It changes nothing unless the user asks.

RevenueDot is not affiliated with RevenueCat, Inc.

## Steps

1. `get-project-health`. For each app in `apps`, note `credentials_configured` and the notification health fields. In `webhooks`, note `delivered_percent_24h` and every entry of `failing` (name, url, `last_error`).
2. `get-metrics` with no `metric` for the overview (MRR, revenue, active subscriptions, active trials, new customers, active customers, last 28 days, USD). Then `get-metrics` with `metric: "mrr"` and `days: 28`, and again with `metric: "new_customers"`, to see the direction.
3. `list-events` with `types: ["BILLING_ISSUE"]` and a small `limit` to count recent billing problems, and `types: ["CANCELLATION"]` for cancellations.
4. If a webhook is failing: `list-webhook-deliveries` with `webhook_id` and `status: "failed"`. Quote the last error and HTTP status. Offer `send-test-webhook` once the user says the endpoint is fixed, and `retry-webhook-delivery` for the failed ones. Do not retry without the user's yes.

## Report

Write at most five lines. Line 1 is the headline itself, with the MRR number: no greeting or summary line before it, and no notes after line 5 unless the user asks.

1. The headline: MRR now, and whether it rose or fell over 28 days.
2. New customers and active subscriptions.
3. Billing issues and cancellations this week.
4. Problems: a store connection that is not configured or a failing webhook, with its error. Say "none" if there are none.
5. The one thing the user should do next, or "nothing needed".

Sandbox numbers are not revenue: use the production overview (the default) and mention sandbox only if the user asks.
