# Annotation justifications

OpenAI's submission asks why each tool sets `readOnlyHint`, `destructiveHint` and `openWorldHint`. `idempotentHint` is set as listed. All tools act only inside the one RevenueDot project the user picked when connecting; none reaches another service except `verify-store-credentials`.

| Tool | readOnly | destructive | openWorld | Why |
|---|---|---|---|---|
| `list-projects` | true | false | false | Reads the project the user picked. |
| `get-project-health` | true | false | false | Reads stored status of apps and webhooks. |
| `get-metrics` | true | false | false | Reads revenue figures RevenueDot already computed. |
| `list-apps` | true | false | false | Reads the project's apps. |
| `list-products` | true | false | false | Reads the project's products. |
| `list-entitlements` | true | false | false | Reads the project's entitlements. |
| `list-offerings` | true | false | false | Reads the project's offerings. |
| `list-customers` | true | false | false | Searches the project's own customer records. |
| `get-customer` | true | false | false | Reads one customer's access, subscriptions and purchases. |
| `list-transactions` | true | false | false | Reads the project's transaction ledger. |
| `list-events` | true | false | false | Reads the project's event log. |
| `list-webhook-integrations` | true | false | false | Reads the project's webhook settings (no secrets). |
| `list-webhook-deliveries` | true | false | false | Reads delivery attempts of one webhook. |
| `get-import-status` | true | false | false | Reads counts after a data import. |
| `verify-store-credentials` | true | false | true | Calls Apple or Google once with the key already saved in the project to say whether it works; it changes nothing and accepts no key. The only tool that reaches another service. |
| `create-product` | false | false | false | Adds a product record; nothing is removed or overwritten. |
| `create-entitlement` | false | false | false | Adds an entitlement record. |
| `create-offering` | false | false | false | Adds an offering; setting it current only changes which offering apps show by default. |
| `create-packages` | false | false | false | Adds a package to an offering. |
| `attach-products-to-entitlement` | false | false | false | Adds links; running it twice gives the same result. |
| `attach-products-to-package` | false | false | false | Adds links; running it twice gives the same result. |
| `grant-customer-entitlement` | false | false | false | Adds time-limited access that ends by itself and can be revoked; no money moves. |
| `set-customer-attributes` | false | false | false | Sets labelled attributes on a customer; the user states each value. |
| `create-webhook-integration` | false | false | false | Adds a webhook; the signing secret is shown once to the user who owns the project. |
| `send-test-webhook` | false | false | false | Sends a clearly marked TEST event to the user's own webhook URL. |
| `retry-webhook-delivery` | false | false | false | Re-sends a failed delivery to the user's own webhook URL. |
| `extend-subscription` | false | false | false | Adds time to a subscription, a goodwill action that needs the separate Money actions approval. |
| `create-test-purchase` | false | false | false | Simulates a purchase in the project's Test Store only; never reaches Apple or Google. Needs the Money actions approval. |
| `revoke-customer-entitlement` | false | true | false | Ends access that was granted; the user cannot get it back without granting again. |
| `delete-customer` | false | true | false | Permanently deletes a customer's data for a data-deletion request; the assistant must ask for confirmation first. |
| `archive-offering` | false | true | false | Hides an offering from apps; it can be restored in the dashboard. Marked destructive because apps stop showing it. |
| `delete-webhook-integration` | false | true | false | Deletes a webhook and its delivery history. |
| `cancel-subscription` | false | true | false | Stops a subscription renewing; the customer loses access at period end. Needs the Money actions approval and a confirmation. |
| `refund-subscription` | false | true | false | Refunds and ends access. Not offered to ChatGPT; offered in Claude and with an API key, behind the Money actions approval and a confirmation. |
