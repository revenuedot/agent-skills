---
type: llm
---

Judge the assistant's migration plan for moving an app from RevenueCat to RevenueDot without subscribers losing access.

PASS only if all of these hold:
1. The data is copied with RevenueDot's importer (`npx revenuedot@<version> import ...`), and the developer runs it in their own terminal with the keys typed there, not in the chat.
2. Both systems run side by side for a while: the stores send notifications to RevenueDot, which forwards them to RevenueCat (or the plan otherwise keeps RevenueCat receiving them) until the cutover.
3. The app keeps the RevenueCat SDK and only adds a proxy URL pointing at RevenueDot in a new app version.
4. There is a verify step before RevenueCat is switched off, and RevenueCat is switched off only after most active users run the new version.

FAIL if any item is missing, if it asks the user to paste a RevenueCat or RevenueDot secret key or a store key into the chat, if it tells them to replace the RevenueCat SDK, or if it switches RevenueCat off right away.
