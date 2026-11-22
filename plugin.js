import { Button as Button2, host, PALETTE_AREA, Tip } from "@hermes/plugin-sdk";

import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, SandboxedFrame } from "@hermes/plugin-sdk";
import { useEffect, useRef, useState } from "react";

var SUBSCRIBE = "plank.ssn-link.subscribe.v1";
var LINK = "plank.ssn-link.intent.v1";
var REMEMBER = "ssn-link-mode-v1";
var isMode = (value) => value === "inside" || value === "external";
function marketURL(value, marketOrigin, allowedPaths) {
  if (typeof value !== "string" || value.length > 4096 || !value.startsWith("https://") || /[\u0000-\u0020\u007f\\]/u.test(value)) return null;
  try {
    const u = new URL(value);
    return u.origin === marketOrigin && !u.username && !u.password && allowedPaths.includes(u.pathname) ? u : null;
  } catch {
    return null;
  }
}
function marketIntent(url, embedUrl, marketOrigin) {
  const link = marketURL(url, marketOrigin, ["/market"]);
  if (!link || [...link.searchParams.keys()].some((key) => /^(buy|checkout|connect)$/i.test(key))) return null;
  const embed2 = marketURL(embedUrl, marketOrigin, ["/market/embed"]);
  return {
    url: link.href,
    site: link.hostname,
    // Never display a different item, filter, or destination behind the same label.
    embedUrl: embed2 && embed2.search === link.search && embed2.hash === link.hash ? embed2.href : null
  };
}
function readLinkEvent(event, { frameWindow, stationOrigin, marketOrigin, session, last }) {
  if (!frameWindow || !session || !event.isTrusted || event.origin !== stationOrigin || event.source !== frameWindow) return null;
  const data = event.data;
  if (!data || typeof data !== "object" || data.type !== LINK || data.session !== session || !Number.isSafeInteger(data.sequence) || data.sequence <= last) return null;
  const intent = marketIntent(data.url, data.embedUrl, marketOrigin);
  return intent && { ...intent, sequence: data.sequence };
}

import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function makeLinkViewer({ stationUrl, marketOrigin }) {
  const stationOrigin = new URL(stationUrl).origin;
  const marketHost = new URL(marketOrigin).hostname;
  return function WebChannel2({ ctx }) {
    const station = useRef(null);
    const subscription = useRef({ session: "", last: 0 });
    const pending = useRef(null);
    const [choice, setChoice] = useState(null);
    const [remember, setRemember] = useState(false);
    const [destination, setDestination] = useState(null);
    function subscribe(event) {
      const session = globalThis.crypto.randomUUID();
      subscription.current = { session, last: 0 };
      pending.current = null;
      setChoice(null);
      event.currentTarget.contentWindow?.postMessage({ type: SUBSCRIBE, session }, stationOrigin);
    }
    function showChoice(intent) {
      pending.current = intent;
      setRemember(false);
      setChoice(intent);
    }
    function clearChoice() {
      pending.current = null;
      setChoice(null);
    }
    function openDestination(mode, intent) {
      if (mode === "external") {
        void ctx.os.openExternal(intent.url);
        return;
      }
      if (intent.embedUrl) setDestination(intent);
    }
    useEffect(() => {
      function onMessage(event) {
        const state = subscription.current;
        const intent = readLinkEvent(event, {
          frameWindow: station.current?.contentWindow,
          stationOrigin,
          marketOrigin,
          session: state.session,
          last: state.last
        });
        if (!intent) return;
        state.last = intent.sequence;
        if (pending.current || document.visibilityState !== "visible" || !document.hasFocus() || document.activeElement !== station.current) return;
        const mode = ctx.storage.get(REMEMBER, null);
        if (isMode(mode) && navigator.userActivation?.isActive && (mode !== "inside" || intent.embedUrl)) {
          openDestination(mode, intent);
        } else {
          showChoice(intent);
        }
      }
      window.addEventListener("message", onMessage);
      return () => {
        window.removeEventListener("message", onMessage);
        pending.current = null;
      };
    }, [ctx]);
    function pick(mode) {
      const intent = pending.current;
      if (!intent || mode === "inside" && !intent.embedUrl) return;
      if (remember) ctx.storage.set(REMEMBER, mode);
      clearChoice();
      openDestination(mode, intent);
    }
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "iframe",
        {
          className: "block min-h-0 w-full flex-1 border-0",
          title: "Sawmill Shopping Network \xB7 live",
          src: stationUrl,
          ref: station,
          onLoad: subscribe,
          referrerPolicy: "no-referrer",
          sandbox: "allow-scripts allow-same-origin",
          allow: "autoplay 'none'; camera 'none'; microphone 'none'; geolocation 'none'; payment 'none'"
        }
      ),
      destination && /* @__PURE__ */ jsxs("section", { "aria-label": "Sawmill link browser", className: "flex min-h-0 min-w-0 flex-col border-t", style: { flex: "0 0 45%" }, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-2 py-1 text-xs", children: [
          /* @__PURE__ */ jsx("span", { children: marketHost }),
          /* @__PURE__ */ jsx(Button, { type: "button", size: "micro", variant: "ghost", onClick: () => setDestination(null), children: "Close Sawmill link" })
        ] }),
        /* @__PURE__ */ jsx(SandboxedFrame, { className: "min-h-0 flex-1", title: `${marketHost} \xB7 Sawmill link`, src: destination.embedUrl }, destination.embedUrl)
      ] }),
      /* @__PURE__ */ jsx(Dialog, { open: choice !== null, onOpenChange: (open) => {
        if (!open) clearChoice();
      }, children: choice && /* @__PURE__ */ jsxs(DialogContent, { children: [
        /* @__PURE__ */ jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsx(DialogTitle, { children: "Open Sawmill link" }),
          /* @__PURE__ */ jsx(DialogDescription, { children: choice.embedUrl ? `Choose where to open ${marketHost}.` : `${marketHost} hasn\u2019t provided an in-Hermes view for this link.` })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "break-all text-xs", title: choice.url, children: choice.url }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: remember,
              onChange: (event) => setRemember(event.currentTarget.checked)
            }
          ),
          " Remember for ",
          marketHost
        ] }),
        /* @__PURE__ */ jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: clearChoice, children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", disabled: !choice.embedUrl, onClick: () => pick("inside"), children: "Open in Hermes" }),
          /* @__PURE__ */ jsx(Button, { type: "button", onClick: () => pick("external"), children: "Open externally" })
        ] })
      ] }) })
    ] });
  };
}

import { jsx as jsx2 } from "react/jsx-runtime";
var id = "ssn-viewer";
var name = "Sawmill TV";
var openLabel = "Open Sawmill TV";
var embed = "https://reserve.plank.love/channel/embed";
var market = "https://market.plank.love";
var WebChannel = makeLinkViewer({ stationUrl: embed, marketOrigin: market });
var entry_default = {
  id,
  name,
  description: "Watch the original Sawmill Shopping Network beside chat.",
  register(ctx) {
    const doc = globalThis.document;
    const browser = doc?.documentElement.dataset.hermesDesktopHost === "browser" && doc.location.protocol === "https:" && doc.location.origin !== new URL(embed).origin;
    const Channel = ctx.sawmill?.Channel ?? (browser ? () => /* @__PURE__ */ jsx2(WebChannel, { ctx }) : void 0);
    if (!Channel || typeof host.openWorkspace !== "function" || typeof host.revealPane !== "function") return;
    let active = true;
    let close;
    function open() {
      if (!active) return;
      if (close) {
        host.revealPane("plugin-workspace:ssn-viewer");
        return;
      }
      close = host.openWorkspace(id, {
        dock: { pane: "workspace", pos: "right" },
        minWidth: "22rem",
        onClose: () => {
          close = void 0;
        },
        render: () => /* @__PURE__ */ jsx2("div", { className: "flex h-full min-h-0 min-w-0 flex-col", children: /* @__PURE__ */ jsx2(Channel, {}) }),
        title: name
      });
    }
    ctx.onDispose(() => {
      active = false;
      close?.();
    });
    ctx.register({ id: "open", area: PALETTE_AREA, data: {
      id: "ssn-viewer.open",
      label: openLabel,
      keywords: ["sawmill", "ssn", "channel"],
      run: open
    } });
    ctx.register({ id: "status", area: "statusBar.right", render: () => /* @__PURE__ */ jsx2(Tip, { label: "Open the live Sawmill channel beside chat", children: /* @__PURE__ */ jsx2(Button2, { "aria-label": openLabel, onClick: open, size: "micro", type: "button", variant: "ghost", children: name }) }) });
    if (browser && !ctx.sawmill?.Channel) ctx.register({ id: "reset-links", area: PALETTE_AREA, data: {
      id: "ssn-viewer.reset-links",
      label: "Reset Sawmill link choice",
      keywords: ["sawmill", "remember", "market"],
      run: () => {
        if (active) {
          ctx.storage.remove(REMEMBER);
          host.notify({ kind: "info", message: "Sawmill links will ask where to open." });
        }
      }
    } });
  }
};
export {
  entry_default as default
};
