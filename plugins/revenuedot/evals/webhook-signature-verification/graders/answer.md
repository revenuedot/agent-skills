---
type: llm
---

Judge the assistant's final answer to a developer writing a Node webhook endpoint that unlocks Pro.

PASS only if all of these hold:
1. It verifies the webhook signature on the raw request body before trusting the event, and keeps the signing secret in server configuration, not in code.
2. It makes processing idempotent (for example by event id) because deliveries can repeat or arrive out of order.
3. It answers quickly with a success status and does the slow work after, and it derives access from the entitlement, not from a single event.
4. It does not ask the user to paste a secret into the chat.

FAIL if any item is missing.
