(function () {
  "use strict";

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") node.className = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      if (typeof c === "string") node.appendChild(document.createTextNode(c));
      else node.appendChild(c);
    });
    return node;
  }

  function getApiBase() {
    var b = window.WR_API_BASE;
    if (!b || typeof b !== "string") return null;
    return b.replace(/\/+$/, "");
  }

  function safeJson(res) {
    return res.text().then(function (t) {
      try { return t ? JSON.parse(t) : {}; } catch (e) { return { raw: t }; }
    });
  }

  function render(container) {
    var apiBase = getApiBase();

    var note = el("div", { class: "wr-note" }, [
      "Demo disclaimer: email is required for this demo only."
    ]);

    var email = el("input", { type: "email", placeholder: "you@example.com", required: "true" });
    var yourWallet = el("input", { type: "text", placeholder: "0x… (optional)" });
    var txHash = el("input", { type: "text", placeholder: "0x… (optional)" });
    var wallets = el("textarea", { placeholder: "Wallets to report (one per line) — optional" });
    var details = el("textarea", { placeholder: "What happened? (optional details)" });

    var status = el("div", { class: "wr-status" }, []);
    var btn = el("button", { class: "wr-btn", type: "button" }, ["Submit report"]);

    function setStatus(msg, isError) {
      status.textContent = msg || "";
      status.className = "wr-status" + (isError ? " wr-error" : "");
    }

    btn.addEventListener("click", function () {
      setStatus("");

      if (!apiBase) {
        setStatus("WR_API_BASE is not set. Add window.WR_API_BASE before loading the snippet.", true);
        return;
      }

      var e = (email.value || "").trim();
      if (!e) {
        setStatus("Email is required in the demo.", true);
        return;
      }

      var walletList = (wallets.value || "")
        .split(/\r?\n/)
        .map(function (s) { return s.trim(); })
        .filter(Boolean);

      var payload = {
        email: e,
        reporter_email: e,              // helps if backend expects reporter_email
        your_wallet: (yourWallet.value || "").trim(),
        tx_hash: (txHash.value || "").trim(),
        wallets: walletList,
        notes: (details.value || "").trim(),
        submitted_at: new Date().toISOString()
      };

      btn.disabled = true;
      setStatus("Submitting…");

      fetch(apiBase + "/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) {
            return safeJson(res).then(function (data) {
              throw new Error("HTTP " + res.status + " " + res.statusText + "\n" + JSON.stringify(data, null, 2));
            });
          }
          return safeJson(res);
        })
        .then(function (data) {
          setStatus("Submitted ✅  Report ID: " + (data.id || data.reportId || "(unknown)"));
        })
        .catch(function (err) {
          setStatus(String(err && err.message ? err.message : err), true);
        })
        .finally(function () {
          btn.disabled = false;
        });
    });

    var card = el("div", { class: "wr-card" }, [
      note,
      el("div", { class: "wr-row" }, [
        el("div", { class: "wr-field" }, [el("label", null, ["Email *"]), email]),
        el("div", { class: "wr-field" }, [el("label", null, ["Your wallet (optional)"]), yourWallet])
      ]),
      el("div", { class: "wr-row" }, [
        el("div", { class: "wr-field" }, [el("label", null, ["Transaction hash (optional)"]), txHash]),
        el("div", { class: "wr-field" }, [el("label", null, ["Reported wallets (optional)"]), wallets])
      ]),
      el("div", { class: "wr-field" }, [el("label", null, ["Details (optional)"]), details]),
      el("div", { class: "wr-actions" }, [btn, status]),
      apiBase ? el("div", { class: "wr-note", html: "API: <code>" + apiBase + "</code>" }, []) :
        el("div", { class: "wr-note wr-error" }, ["WR_API_BASE is not set."])
    ]);

    container.innerHTML = "";
    container.appendChild(card);
  }

  function boot() {
    var container = document.getElementById("wallet-reporters-widget");
    if (!container) {
      // fallback: append to body if container missing
      container = document.createElement("div");
      container.id = "wallet-reporters-widget";
      document.body.appendChild(container);
    }
    render(container);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();