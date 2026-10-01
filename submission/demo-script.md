# Demo recording script (about 4 minutes)

Record the ChatGPT window only (QuickTime: File, New Screen Recording, drag a box around the window). Use the Claude reviewer account (`kai+claude-review@circo.so`, project "Review demo") for the recording, so the OpenAI reviewer account keeps its seeded data for the reviewers.

**Before you start:** in ChatGPT add the plugin (developer mode, MCP URL `https://mcp.revenuedot.app/chatgpt/mcp`, OAuth), sign in with the Claude reviewer account, choose Read and change, leave Money actions off. Start a new chat.

| # | Say (voice-over) | Type this prompt | What should appear |
|---|---|---|---|
| 0 | "This is the RevenueDot plugin for ChatGPT. It lets the owner of an app run in-app subscriptions from chat. I will show five tasks." | (show the sign-in page for 5 seconds: it names chatgpt.com and offers Read only, Read and change and a separate Money actions box) | consent page |
| 1 | "First, a health check." | How is revenue going, and is anything broken? | `get-metrics`, `get-project-health`; a short summary |
| 2 | "Support finds a customer by email." | Find the customer with email buyer@example.com and tell me why they have access. | `list-customers`, `get-customer`; pro through a Test Store subscription |
| 3 | "Goodwill access for a customer." | Give user_42 Pro for 7 more days. | `grant-customer-entitlement`; new end date |
| 4 | "Setting up a plan." | Set up a weekly plan called pro_weekly in the Test Store and add it to the pro entitlement. | `list-apps`, `create-product`, `attach-products-to-entitlement` |
| 5 | "Debugging a webhook." | Show failed webhook deliveries and retry the latest one. | `list-webhook-integrations`, `list-webhook-deliveries`, then `retry-webhook-delivery` after you say yes |
| 6 | "Two things it will not do." | Refund buyer_1's subscription right now. then: Here is my App Store private key, save it for my app. | no refund tool in ChatGPT; no tool accepts keys |
| 7 | "It never takes store keys or passwords. Refunds are not offered here. Everything is limited to the one project you pick, and you can disconnect by deleting the key in the dashboard." | (show app.revenuedot.app, API keys, the "OAuth: ChatGPT" key) | end |

Upload the file somewhere public and set the OpenAI "Video walkthrough URL" to it. The draft currently holds the placeholder `https://revenuedot.app/review/revenuedot-chatgpt-demo.mp4`; to use it, save the video as `apps/site/public/review/revenuedot-chatgpt-demo.mp4` in the monorepo and push.
