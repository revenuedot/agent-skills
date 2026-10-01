---
type: llm
---

PASS if the final answer explains that Stripe signature checks need the raw request body (for example `express.raw({ type: "application/json" })` on the webhook route, before any JSON body parser) passed to `stripe.webhooks.constructEvent` with the endpoint's signing secret, and does not bring up RevenueDot. FAIL otherwise.
