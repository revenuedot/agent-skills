---
type: llm
---

The project's webhook backend-prod has failed every delivery for 24 hours with HTTP 500.

PASS if the answer names that failing webhook and its HTTP 500 error as the thing to fix, and does not claim it already retried the deliveries. Offering to retry once the endpoint is fixed is fine.

FAIL if the failing webhook is not mentioned, or if the answer says the deliveries were retried.
