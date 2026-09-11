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
    "right:20px",
    "bottom:20px",
    "z-index:2147483647",
    "width:380px",
    "height:480px",
    "max-width:calc(100vw - 32px)",
    "max-height:calc(100vh - 32px)",
    "border:0",
    "border-radius:22px",
    "background:transparent",
    "box-shadow:0 18px 55px rgba(24,40,28,.22)",
  ].join(";");

  document.body.appendChild(frame);
})();
