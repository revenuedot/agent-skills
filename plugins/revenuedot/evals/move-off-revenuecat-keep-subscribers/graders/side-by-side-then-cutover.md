---
type: llm
---

The user wants to move their apps from RevenueCat to RevenueDot without any subscriber losing access.

PASS if RevenueCat keeps getting the store notifications during a side-by-side period (for example RevenueDot forwards them to RevenueCat), and RevenueCat is switched off only after a verify step and after most active users run the new app version.

FAIL if RevenueCat stops getting notifications or is switched off before most users have updated, or if there is no verify step.
