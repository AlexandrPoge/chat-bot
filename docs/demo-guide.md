# Helpwise demo guide

Use this guide for the required product presentation. A concise screen recording is preferred; the same sequence also works as a written walkthrough when a screenshot is captured at each numbered step.

## Start the app

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and log in with a Supabase account. Test AI stays free and does not call an external model. Add the optional values from `.env.example` before demonstrating source-grounded Gemini answers.

## Three-minute recording script

1. Landing page — 20 seconds

   Start at `/`. Explain the promise: Helpwise turns a company knowledge base into a source-grounded support guide. Scroll through the product preview, three focused benefits, and Starter/Pro pricing.

   Screenshot: hero plus the in-product chat preview.

2. Product workspace — 35 seconds

   Select **Create your first bot**. At `/dashboard`, point out the knowledge health card, answer volume, source confidence, and the private bot-testing conversation.

   Screenshot: dashboard overview.

3. Source-grounded answers — 40 seconds

   In the private chat, ask: `Can I invite a client to a project?` Show that Orbit returns a direct answer grounded in the active knowledge. Then open **Knowledge** and explain that every answer is limited to the selected uploaded source.

   Screenshot: a useful answer grounded in the selected source.

4. Knowledge ingestion — 25 seconds

   In **Knowledge**, choose **Add sources** and upload a PDF, DOCX, TXT, or Markdown file. Show the `Indexing` state change to `Ready`, the active-source switch, and the Supabase sync state after signing in. Explain that the bot embeds and retrieves relevant passages from the selected source without cluttering its customer-facing reply with a filename.

   Screenshot: knowledge table after upload.

5. Customer-facing widget — 40 seconds

   Open **Widget**. Copy the generated script and then choose **Open test site**. The Orbit marketing page loads the small independent iframe through `public/widget.js`, proving that the widget is not just a dashboard preview. Ask it: `What does Pro include?`

   Screenshot: Orbit site with the widget visible and an answer in the chat.

6. Pricing and gated capability — 20 seconds

   Return to the workspace and select **Plan: Starter**. Show the simulated Pro trial. After activation, the UI acknowledges the change; no real payment or card data is requested.

   Screenshot: Starter/Pro test billing modal.

## What to call out to a reviewer

- Scope is intentionally narrow: knowledge sources, an answer-testing surface, a public widget, and a transparent billing model.
- The product avoids ungrounded claims: analytics link each answer to its knowledge source, while the customer-facing reply stays clean and the server prompt instructs the model not to guess.
- The compact widget loader works independently of the application shell and can be tested at `/demo.html`.
- The billing screen is deliberately labelled as a mock flow. It records a `$39` successful test event and the selected plan in Supabase, but never transmits card fields or charges money.
- `npm run lint` and `npm run build` pass before each release commit.

## Live Gemini setup

Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY`. Helpwise then uses Gemini only from the server-side `/api/chat` route. The key is not exposed to browser code, never belongs in Git, and the selected source is sent only when someone submits a chat question.
