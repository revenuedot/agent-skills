---
type: llm
---

Judge the assistant's final answer to a developer designing a SwiftUI paywall with a 7 day free trial.

PASS only if all of these hold:
1. It picks a layout or pattern (for example annual-first or a trial timeline) and describes its parts.
2. It says the price and billing period after the trial must be shown clearly near the trial offer, and that the screen needs a restore purchases action and links to terms and privacy.
3. It says to show prices from the store (localized product prices) instead of hard-coded text.
4. It does not ask the user for a key or secret.

FAIL if any item is missing.
