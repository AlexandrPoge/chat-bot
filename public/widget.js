(() => {
  const script = document.currentScript;

  if (!(script instanceof HTMLScriptElement) || script.dataset.helpwiseLoaded === "true") {
    return;
  }

  script.dataset.helpwiseLoaded = "true";
  const botId = script.dataset.bot;
  if (!botId) {
    console.warn("Helpwise widget needs a data-bot attribute.");
    return;
  }

  const origin = new URL(script.src).origin;
  const frame = document.createElement("iframe");
  frame.src = `${origin}/widget/${encodeURIComponent(botId)}`;
  frame.title = "Helpwise support chat";
  frame.setAttribute("aria-label", "Open support chat");
  frame.style.cssText = [
    "position:fixed",
    "right:clamp(12px, 2vw, 20px)",
    "bottom:clamp(12px, 2vw, 20px)",
    "z-index:2147483647",
    "width:min(390px, calc(100vw - 24px))",
    "height:min(580px, calc(100dvh - 24px))",
    "min-height:min(460px, calc(100dvh - 24px))",
    "border:0",
    "border-radius:22px",
    "background:transparent",
    "box-shadow:0 18px 55px rgba(24,40,28,.22)",
  ].join(";");

  document.body.appendChild(frame);
})();
