const ArrowUpRight = () => <span aria-hidden="true">↗</span>;

function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M12 2.5c.6 5.2 3.2 7.8 8.4 8.4-5.2.6-7.8 3.2-8.4 8.4-.6-5.2-3.2-7.8-8.4-8.4C8.8 10.3 11.4 7.7 12 2.5Z" fill="currentColor" />
    </svg>
  );
}

function Check() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="m5 10 3.2 3.2L15.5 6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#fbfaf7] text-[#1b1e1e]">
      <section className="relative isolate px-5 pb-20 pt-5 sm:px-8 lg:px-12 lg:pb-28">
        <div className="landing-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[700px] opacity-60" />
        <div className="pointer-events-none absolute left-1/2 top-[-360px] -z-10 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-[#d8fa8d]/45 blur-3xl" />
        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-[#e5e4de] bg-[#fbfaf7]/80 px-4 py-3 backdrop-blur-md sm:px-5">
          <a className="flex items-center gap-2.5 font-semibold tracking-[-0.045em]" href="#top">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#1d2420] text-[#d8fa8d]"><Sparkle className="h-4 w-4" /></span>
            <span className="text-xl">helpwise</span>
          </a>
          <div className="hidden items-center gap-7 text-sm font-medium text-[#62675f] md:flex">
            <a className="transition hover:text-[#1b1e1e]" href="#how-it-works">How it works</a>
            <a className="transition hover:text-[#1b1e1e]" href="#features">Features</a>
            <a className="transition hover:text-[#1b1e1e]" href="#pricing">Pricing</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <a className="hidden text-sm font-medium text-[#4a514b] transition hover:text-[#1d2420] sm:block" href="/login">Log in</a>
            <a className="inline-flex items-center gap-2 rounded-xl bg-[#1d2420] px-3.5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#313b35] sm:px-4" href="/login">Build your bot <ArrowUpRight /></a>
          </div>
        </nav>

        <div className="mx-auto max-w-7xl pt-20 lg:pt-28" id="top">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#cbd6bd] bg-[#f4faeb] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#526443]"><span className="h-1.5 w-1.5 rounded-full bg-[#6f9e36]" />AI support, grounded in your docs</p>
            <h1 className="mt-6 text-balance text-5xl font-semibold leading-[0.97] tracking-[-0.07em] text-[#1d2420] sm:text-6xl lg:text-8xl">Turn every question into a clear answer.</h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-7 text-[#62675f] sm:text-lg">Helpwise turns your product knowledge into a helpful AI guide — in your workspace and on every page of your website.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1d2420] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1d2420]/10 transition hover:-translate-y-0.5" href="/login">Create your first bot <ArrowUpRight /></a>
              <a className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d8d9d2] bg-white px-5 py-3.5 text-sm font-semibold text-[#3f4740] transition hover:border-[#b8c2af]" href="#how-it-works">See how it works <span aria-hidden="true">↓</span></a>
            </div>
            <p className="mt-4 text-xs text-[#81877e]">Free to start · No credit card required</p>
          </div>

          <div className="relative mx-auto mt-14 max-w-6xl rounded-[2rem] border border-[#d6d8cf] bg-[#f3f5ee] p-3 shadow-[0_32px_90px_-35px_rgba(37,52,36,0.35)] sm:p-5">
            <div className="overflow-hidden rounded-[1.45rem] border border-[#dce0d8] bg-white">
              <div className="flex items-center justify-between border-b border-[#e9ebe6] px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2.5"><span className="flex -space-x-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#ffb4a7]" /><i className="h-2.5 w-2.5 rounded-full bg-[#f8d785]" /><i className="h-2.5 w-2.5 rounded-full bg-[#a6d998]" /></span><span className="hidden text-xs font-medium text-[#92978f] sm:block">app.helpwise.ai / bots / orbit</span></div>
                <div className="rounded-lg bg-[#f1f5ed] px-2.5 py-1 text-[11px] font-semibold text-[#668246]">● Live</div>
              </div>
              <div className="grid min-h-[425px] grid-cols-1 lg:grid-cols-[215px_1fr_245px]">
                <aside className="hidden border-r border-[#e9ebe6] bg-[#fbfcf9] p-4 lg:block">
                  <div className="mb-7 flex items-center gap-2.5 px-2 text-sm font-semibold"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#e7f8ba] text-[#49621c]">O</span>Orbit Labs</div>
                  <p className="px-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[#9ca198]">Workspace</p>
                  <div className="mt-2 space-y-1 text-sm"><p className="rounded-lg bg-[#edf2e8] px-2.5 py-2 font-semibold text-[#485247]">✦ Overview</p><p className="px-2.5 py-2 text-[#848b82]">◫ Knowledge</p><p className="px-2.5 py-2 text-[#848b82]">◌ Conversations</p><p className="px-2.5 py-2 text-[#848b82]">⌘ Widget</p></div>
                </aside>
                <div className="p-5 sm:p-7">
                  <div className="flex items-start justify-between"><div><p className="text-xs font-medium text-[#81887e]">Your AI guide</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.04em]">Orbit support bot</h2></div><button className="rounded-lg border border-[#dce1d9] px-3 py-1.5 text-xs font-semibold text-[#5d665c]">Preview</button></div>
                  <div className="mt-7 space-y-4"><div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-md bg-[#1f2822] px-4 py-3 text-sm leading-5 text-white">Can I invite a client to a project?</div><div className="max-w-[88%] rounded-2xl rounded-tl-md border border-[#e0e5dc] bg-[#f8faf6] px-4 py-3 text-sm leading-5 text-[#4e584f]">Yes. On the project page, choose <b>Share</b> and enter their email. Guests can comment and view deliverables, but can&apos;t change project settings.<p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#6c8a45]"><span>↗</span>Cited from: Team collaboration guide</p></div></div>
                  <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#e2e5df] px-3.5 py-3 text-sm text-[#9ba198]">Ask anything about Orbit...<span className="ml-auto grid h-6 w-6 place-items-center rounded-md bg-[#e8f6bf] text-[#536e2d]">↑</span></div>
                </div>
                <aside className="border-t border-[#e9ebe6] bg-[#fcfdfa] p-5 lg:border-l lg:border-t-0"><p className="text-xs font-semibold text-[#4d564d]">Knowledge health</p><p className="mt-1 text-xs leading-5 text-[#8a9187]">Your bot is ready to answer.</p><div className="mt-5 rounded-xl border border-[#e1e5dd] bg-white p-3.5"><div className="flex items-center justify-between text-xs"><span className="font-medium text-[#626b60]">14 sources</span><span className="font-semibold text-[#749743]">Synced</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e7ece2]"><div className="h-full w-[88%] rounded-full bg-[#9aca58]" /></div><p className="mt-2 text-[11px] text-[#9aa197]">Last updated 4 min ago</p></div><div className="mt-5 rounded-xl bg-[#1f2822] p-4 text-white"><Sparkle className="h-4 w-4 text-[#d8fa8d]" /><p className="mt-3 text-xs font-semibold">93% answer confidence</p><p className="mt-1 text-[11px] leading-4 text-[#b3beb3]">Answers cite the source docs your team uploaded.</p></div></aside>
              </div>
            </div>
            <div className="pointer-events-none absolute -bottom-5 -right-2 hidden w-60 rounded-2xl border border-[#d8ded0] bg-white p-4 shadow-xl sm:block"><div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#e7f8ba] font-semibold text-[#4d6829]">O</span><span className="text-xs font-semibold">How can we help?</span><span className="ml-auto text-[#8b9585]">×</span></div><p className="mt-3 text-[11px] leading-4 text-[#737c73]">Ask Orbit anything about the product, billing, or your account.</p><div className="mt-3 rounded-lg bg-[#f2f5ee] px-2.5 py-2 text-[10px] text-[#a0a79d]">Type a question...</div></div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e5e6df] bg-white px-5 py-8 sm:px-8"><p className="text-center text-xs font-bold uppercase tracking-[0.16em] text-[#9aa096]">Built for teams that care about helpful support</p><div className="mx-auto mt-7 flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-5 text-lg font-semibold tracking-[-0.05em] text-[#a7ada5] sm:justify-between sm:text-xl"><span>daylight</span><span>FULCRUM</span><span>coastline</span><span>nearby</span><span>WILLOW</span></div></section>

      <section className="px-5 py-24 sm:px-8 lg:py-32" id="features"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#729247]">Useful by design</p><h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">Everything your customers need. Nothing they don&apos;t.</h2><p className="mt-5 max-w-xl text-pretty leading-7 text-[#6c746b]">One focused workflow, from the knowledge your team already has to confident answers in the places customers ask.</p></div><div className="mt-12 grid gap-4 md:grid-cols-3">{[["01", "Ground every answer", "Upload the docs that matter. Helpwise retrieves relevant sections and shows customers exactly where an answer came from."], ["02", "Test before you publish", "Chat with your bot in a private workspace. See source citations, adjust its voice, and only then share it with the world."], ["03", "Embed in a minute", "Copy one lightweight snippet. Your on-brand widget works wherever your customers already come for help."]].map(([number, title, copy]) => <article className="rounded-2xl border border-[#e3e5de] bg-white p-6 transition hover:-translate-y-1 hover:border-[#cad4bc] hover:shadow-lg hover:shadow-[#4d5b43]/5" key={number}><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf4df] text-xs font-bold text-[#607f38]">{number}</span><h3 className="mt-12 text-xl font-semibold tracking-[-0.04em]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#737a72]">{copy}</p></article>)}</div></div></section>

      <section className="bg-[#202823] px-5 py-24 text-white sm:px-8 lg:py-32" id="how-it-works"><div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#b7dc73]">From docs to dialogue</p><h2 className="mt-4 text-balance text-4xl font-semibold leading-[1] tracking-[-0.06em] sm:text-5xl">Set up a support expert before lunch.</h2><p className="mt-5 max-w-md leading-7 text-[#b8c0b8]">Helpwise keeps setup human and intentional. You&apos;re always in control of what your bot knows and how it behaves.</p><a className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#dbffa0]" href="/login">Start building for free <ArrowUpRight /></a></div><div className="space-y-3">{[["1", "Bring your best knowledge", "Drop in product guides, help articles, policies, and FAQs. We organize them into a searchable source of truth."], ["2", "Make it sound like you", "Name your bot, write a welcome message, and set simple guardrails. Preview every answer before it reaches customers."], ["3", "Put help where it helps", "Publish the widget with one script tag. It respects your brand, works on mobile, and is ready for real questions."]].map(([number, title, copy]) => <article className="flex gap-5 rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:bg-white/[0.07] sm:p-6" key={number}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#d9fb97] text-xs font-bold text-[#263026]">{number}</span><div><h3 className="font-semibold tracking-[-0.03em]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#b2bbb1]">{copy}</p></div></article>)}</div></div></section>

      <section className="px-5 py-24 sm:px-8 lg:py-32" id="pricing"><div className="mx-auto max-w-5xl text-center"><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#729247]">Simple, honest pricing</p><h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">Start small. Scale when it helps.</h2><p className="mx-auto mt-4 max-w-lg leading-7 text-[#747b72]">Every plan includes a grounded, customer-ready AI bot. Upgrade only when your support needs grow.</p><div className="mt-12 grid gap-4 text-left md:grid-cols-2"><article className="rounded-2xl border border-[#e0e3da] bg-white p-7"><p className="font-semibold">Starter</p><p className="mt-4 text-4xl font-semibold tracking-[-0.06em]">$0 <span className="text-base font-medium tracking-normal text-[#8b9289]">/ month</span></p><p className="mt-3 min-h-12 text-sm leading-6 text-[#747c73]">A polished first bot for a focused knowledge base.</p><a className="mt-6 flex justify-center rounded-xl border border-[#d5d9d1] px-4 py-3 text-sm font-semibold text-[#485247]" href="#get-started">Get started</a><ul className="mt-6 space-y-3 text-sm text-[#5e675e]">{["1 active bot", "20 knowledge sources", "1,000 answers / month", "Helpwise widget"].map((item) => <li className="flex gap-2" key={item}><span className="mt-0.5 h-4 w-4 text-[#6c9340]"><Check /></span>{item}</li>)}</ul></article><article className="relative rounded-2xl bg-[#202823] p-7 text-white shadow-xl shadow-[#31402d]/15"><span className="absolute right-5 top-5 rounded-full bg-[#d9fb97] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#374534]">Most popular</span><p className="font-semibold">Pro</p><p className="mt-4 text-4xl font-semibold tracking-[-0.06em]">$39 <span className="text-base font-medium tracking-normal text-[#aab6aa]">/ month</span></p><p className="mt-3 min-h-12 text-sm leading-6 text-[#aeb9ae]">For teams turning support into a product advantage.</p><a className="mt-6 flex justify-center rounded-xl bg-[#d9fb97] px-4 py-3 text-sm font-semibold text-[#303d2f] transition hover:bg-[#e5ffb1]" href="#get-started">Start 14-day trial</a><ul className="mt-6 space-y-3 text-sm text-[#d0d8d0]">{["Everything in Starter", "5 active bots", "Unlimited sources", "Remove Helpwise branding", "Custom colors and domain allowlist"].map((item) => <li className="flex gap-2" key={item}><span className="mt-0.5 h-4 w-4 text-[#d9fb97]"><Check /></span>{item}</li>)}</ul></article></div><p className="mt-5 text-xs text-[#949b92]">Billing is securely simulated in this product demo. No payments are taken.</p></div></section>

      <section className="px-5 pb-5 sm:px-8" id="get-started"><div className="mx-auto max-w-7xl rounded-[2rem] bg-[#d9fb97] px-6 py-16 text-center sm:px-12 lg:py-24"><Sparkle className="mx-auto h-7 w-7 text-[#3e582a]" /><h2 className="mx-auto mt-5 max-w-2xl text-balance text-4xl font-semibold leading-[1] tracking-[-0.06em] text-[#273128] sm:text-5xl">Give customers an answer they can trust.</h2><p className="mx-auto mt-5 max-w-lg text-pretty leading-7 text-[#506047]">Create a knowledgeable, on-brand guide in minutes. Your first bot is free forever.</p><a className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#202823] px-5 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5" href="/login">Create your first bot <ArrowUpRight /></a></div></section>
      <footer className="px-5 py-10 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-[#e3e5df] pt-7 text-sm text-[#7a8178] sm:flex-row sm:items-center sm:justify-between"><span className="font-semibold tracking-[-0.04em] text-[#3d463e]">helpwise</span><div className="flex gap-5"><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="mailto:hello@helpwise.ai">Contact</a></div><span>© 2026 Helpwise, Inc.</span></div></footer>
    </main>
  );
}
