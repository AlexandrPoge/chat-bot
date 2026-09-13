(() => {
  const script = document.currentScript;
  if (!(script instanceof HTMLScriptElement) || script.dataset.helpwiseLoaded === "true") return;
  script.dataset.helpwiseLoaded = "true";
  const botId = script.dataset.bot;
  if (!botId) {
    console.warn("Helpwise widget needs a data-bot attribute.");
    return;
  }

  const origin = new URL(script.src).origin;
  const frame = document.createElement("iframe");
  const launcher = document.createElement("button");
  const mascot = document.createElement("img");
  const sourceId = script.dataset.source;
  const sourceQuery = sourceId ? `?source=${encodeURIComponent(sourceId)}` : "";
  frame.src = `${origin}/widget/${encodeURIComponent(botId)}${sourceQuery}`;
  frame.title = "Helpwise support chat";
  frame.className = "helpwise-widget-frame";
  frame.style.cssText = [
    "position:fixed", "right:clamp(12px,2vw,20px)", "bottom:84px", "z-index:2147483647",
    "width:min(370px,calc(100vw - 24px))", "height:min(520px,calc(100dvh - 108px))",
    "min-height:0", "border:0", "border-radius:22px", "background:transparent",
    "box-shadow:0 18px 55px rgba(24,40,28,.22)", "transition:opacity .2s ease,transform .2s ease",
  ].join(";");
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Open support chat");
  launcher.className = "helpwise-widget-launcher";
  launcher.style.cssText = [
    "position:fixed", "right:clamp(12px,2vw,20px)", "bottom:clamp(12px,2vw,20px)", "z-index:2147483647",
    "display:grid", "place-items:center", "width:58px", "height:58px", "padding:0", "border:0",
    "border-radius:19px", "background:#202823", "cursor:pointer", "box-shadow:0 12px 30px rgba(24,40,28,.28)",
    "transition:transform .2s ease,box-shadow .2s ease",
  ].join(";");
  mascot.src = `${origin}/mascot/orbit-support-mascot.png`;
  mascot.alt = "";
  mascot.style.cssText = "width:46px;height:46px;border-radius:15px;object-fit:cover";
  launcher.appendChild(mascot);

  const setOpen = (open) => {
    frame.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    launcher.setAttribute("aria-label", open ? "Support chat is open" : "Open support chat");
  };
  launcher.addEventListener("click", () => setOpen(frame.hidden));
  launcher.addEventListener("mouseenter", () => { launcher.style.transform = "translateY(-2px) scale(1.03)"; });
  launcher.addEventListener("mouseleave", () => { launcher.style.transform = "none"; });
  window.addEventListener("message", (event) => {
    if (event.origin === origin && event.source === frame.contentWindow && event.data?.type === "helpwise:close") setOpen(false);
  });

  if (!document.getElementById("helpwise-widget-mobile-style")) {
    const style = document.createElement("style");
    style.id = "helpwise-widget-mobile-style";
    style.textContent = "@media(max-width:480px){.helpwise-widget-frame{right:8px!important;bottom:76px!important;width:calc(100vw - 16px)!important;height:min(480px,calc(100dvh - 92px))!important;border-radius:18px!important}.helpwise-widget-launcher{right:10px!important;bottom:10px!important}}@media(max-height:560px){.helpwise-widget-frame{height:calc(100dvh - 84px)!important}}";
    document.head.appendChild(style);
  }
  document.body.append(frame, launcher);
  setOpen(script.dataset.open === "true");
})();
