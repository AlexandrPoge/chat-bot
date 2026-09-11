# Helpwise demo guide

Use this guide for the required product presentation. A concise screen recording is preferred; the same sequence also works as a written walkthrough when a screenshot is captured at each numbered step.

## Start the app

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The app runs in demo mode without credentials. Add the optional values from `.env.example` before demonstrating live OpenAI answers.

## Three-minute recording script

1. Landing page — 20 seconds

   Start at `/`. Explain the promise: Helpwise turns a company knowledge base into a source-grounded support guide. Scroll through the product preview, three focused benefits, and Starter/Pro pricing.

   Screenshot: hero plus the in-product chat preview.

2. Product workspace — 35 seconds

   Select **Create your first bot**. At `/dashboard`, point out the knowledge health card, answer volume, source confidence, and the private bot-testing conversation.

   Screenshot: dashboard overview.

3. Source-grounded answers — 40 seconds

   In the private chat, ask: `Can I invite a client to a project?` Show that Orbit returns a direct answer and cites `Team collaboration guide.pdf`. Then open **Knowledge** and explain that every answer is limited to the uploaded sources.

   Screenshot: answer plus visible source citation.

4. Knowledge ingestion — 25 seconds

   In **Knowledge**, choose **Add sources** and upload a `.txt` or `.md` file. Show the `Indexing` state change to `Ready`. Explain that this local demo keeps files in the browser; production storage and vector search are prepared as the next deployment integration.

   Screenshot: knowledge table after upload.

5. Customer-facing widget — 40 seconds

   Open **Widget**. Copy the generated script and then choose **Open demo site**. The Orbit marketing page loads a separate iframe through `public/widget.js`, proving that the widget is not just a dashboard preview. Ask it: `What does Pro include?`

   Screenshot: Orbit site with the widget visible and an answer in the chat.

6. Pricing and gated capability — 20 seconds

   Return to the workspace and select **Plan: Starter**. Show the simulated Pro trial. After activation, the UI acknowledges the change; no real payment or card data is requested.

   Screenshot: Starter/Pro test billing modal.

## What to call out to a reviewer

- Scope is intentionally narrow: knowledge sources, an answer-testing surface, a public widget, and a transparent billing model.
- The product avoids ungrounded claims: answers display their knowledge source, and the server prompt instructs the model not to guess.
- The widget loader works independently of the application shell and can be tested at `/demo.html`.
- The billing screen is deliberately labelled as a mock flow, satisfying the assignment without pretending to take payment.
- `npm run lint` and `npm run build` pass before each release commit.

## Live AI setup

Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY`. Helpwise then uses the server-only `/api/chat` route and the Responses API. The key is not exposed to browser code, never belongs in Git, and source summaries are sent to OpenAI only when someone submits a chat question while live AI is configured.
