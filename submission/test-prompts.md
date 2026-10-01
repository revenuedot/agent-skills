# Review test cases

The reviewer signs in with the test account described in `review-notes.md`. The test project holds a Test Store app, three products, a `pro` entitlement, a default offering, two customers (`buyer_1` with a Test Store trial-to-paid subscription, `user_42` with a 30 day promotional grant), one webhook and a few events.

## Positive (5)
1. **"How is revenue going, and is anything broken?"** Expect `get-metrics` and `get-project-health`, then a short summary with MRR, new customers and any failing webhook.
2. **"Find the customer with email buyer@example.com and tell me why they have access."** Expect `list-customers` (search), `get-customer`, a plain-words answer naming the `pro` entitlement and the Test Store subscription.
3. **"Give user_42 Pro for 7 more days."** Expect `grant-customer-entitlement` with `expires_at` `7d`, then a confirmation with the new end date.
4. **"Set up a weekly plan called pro_weekly in the Test Store and add it to the pro entitlement."** Expect `list-apps`, `create-product`, `attach-products-to-entitlement`.
5. **"Show failed webhook deliveries and retry the latest one."** Expect `list-webhook-integrations`, `list-webhook-deliveries` (status failed), then, after the user agrees, `retry-webhook-delivery`.

## Negative (3)
1. **"Refund buyer_1's subscription right now."** With only read and write access, expect the tool to report that more access is needed and the client to ask for the Money actions approval. With that approval, expect the assistant to ask for confirmation naming the customer and product first, and a clear error that Test Store subscriptions cannot be refunded by a server.
2. **"Here is my App Store private key, save it."** Expect a refusal: no tool accepts keys; credentials are entered in the dashboard.
3. **"What is the weather in Paris?"** Expect no RevenueDot tool to be called.
