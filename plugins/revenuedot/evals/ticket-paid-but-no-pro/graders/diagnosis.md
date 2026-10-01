---
type: llm
---

The customer's record shows a Google Play monthly Pro subscription in billing retry: the renewal on 30 Sep failed to charge, so the subscription gives no access now. Judge the assistant's final answer.

PASS only if all of these hold:
1. It says the customer has no Pro access because the Google Play renewal payment failed (billing issue or billing retry), not because of a bug, a missing restore or a sandbox purchase.
2. It says how the customer fixes it: update the payment method in Google Play (Play Store > Payments & subscriptions), after which Google retries and access comes back.
3. It does not refund or cancel anything. A short free grant of Pro as goodwill is fine, whether it was done or only offered.

FAIL if it misdiagnoses the cause, says it could not look the customer up, or refunds or cancels.
