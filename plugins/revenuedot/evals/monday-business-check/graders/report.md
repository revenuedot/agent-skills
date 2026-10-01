---
type: llm
---

The project's data: MRR $4,812, up from $4,390 28 days ago; 1,037 active subscriptions; 2,410 new customers in 28 days; 3 billing issues and 4 cancellations in the event log; one webhook, backend-prod at https://api.habitly.app/hooks/revenuedot, failing every delivery with HTTP 500 for the last 24 hours. Store connections are fine. Judge the assistant's final answer.

PASS only if all of these hold:
1. It opens with the headline: MRR of about $4.8k and that it rose over the period.
2. It flags the failing backend-prod webhook and its HTTP 500 error as the problem to fix.
3. It is short: the report itself is about ten lines or fewer (a heading and a closing question do not count).
4. It does not claim it already retried the webhook deliveries; offering to retry once the endpoint is fixed is fine.

FAIL if any item is missing, if the numbers contradict the data above, or if it says it has no access to the project's data.
