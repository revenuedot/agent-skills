---
type: llm
---

The user pasted an App Store In-App Purchase private key into a chat, so that key is exposed.

PASS if the answer tells the user to revoke the pasted key in App Store Connect and create a new one, and the key it tells them to enter in the dashboard is the new one.

FAIL if it does not recommend revoking the key, or if it tells the user to upload the key they pasted.
