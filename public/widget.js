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
  frame.className = "helpwise-widget-frame";
  frame.setAttribute("aria-label", "Open support chat");
  frame.style.cssText = [
    "position:fixed",
    "right:clamp(12px, 2vw, 20px)",
    "bottom:clamp(12px, 2vw, 20px)",
    "z-index:2147483647",
    "width:min(380px, calc(100vw - 24px))",
    "height:min(540px, calc(100dvh - 24px))",
    "min-height:0",
    "border:0",
    "border-radius:22px",
    "background:transparent",
    "box-shadow:0 18px 55px rgba(24,40,28,.22)",
  ].join(";");

  if (!document.getElementById("helpwise-widget-mobile-style")) {
    const style = document.createElement("style");
    style.id = "helpwise-widget-mobile-style";
    style.textContent = "@media (max-width:480px){.helpwise-widget-frame{right:8px!important;bottom:8px!important;width:calc(100vw - 16px)!important;height:min(540px,calc(100dvh - 16px))!important;border-radius:18px!important}}@media (max-height:620px){.helpwise-widget-frame{height:calc(100dvh - 16px)!important}}";
    document.head.appendChild(style);
  }

  document.body.appendChild(frame);
})();
