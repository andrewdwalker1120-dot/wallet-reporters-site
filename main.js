(() => {
  const modal = document.getElementById("wrModal");
  const openBtns = ["openReportTop","openReportHero","openReportLower"].map(id => document.getElementById(id)).filter(Boolean);

  function openModal(){
    if(!modal) return;
    modal.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
    setTimeout(()=>modal.querySelector("input,select,textarea,button")?.focus(),60);
  }
  function closeModal(){
    if(!modal) return;
    modal.setAttribute("aria-hidden","true");
    document.body.style.overflow="";
  }

  openBtns.forEach(b=>b.addEventListener("click",openModal));
  modal?.addEventListener("click",(e)=>{ if(e.target?.matches("[data-close]")) closeModal(); });
  window.addEventListener("keydown",(e)=>{ if(e.key==="Escape" && modal?.getAttribute("aria-hidden")==="false") closeModal(); });

  // Demo recent reports
  const tbodies = document.querySelectorAll("#recentReports");
  const demo = JSON.parse(localStorage.getItem("wr_demo_reports") || "[]");
  const seeded = demo.length ? demo : seed();
  tbodies.forEach(tbody=>{
    tbody.innerHTML = seeded.slice().reverse().slice(0,6).map(r=>row(r)).join("");
  });

  // Registry search
  const searchBtn=document.getElementById("searchBtn");
  const searchWallet=document.getElementById("searchWallet");
  const searchResult=document.getElementById("searchResult");
  if(searchBtn && searchWallet && searchResult){
    searchBtn.addEventListener("click",()=>{
      const q=(searchWallet.value||"").trim().toLowerCase();
      if(!q){ searchResult.textContent="Paste a wallet address to search."; return; }
      const items = JSON.parse(localStorage.getItem("wr_demo_reports") || "[]");
      const hit = items.find(r => (r.reported_wallets||[]).some(w => (w||"").toLowerCase()===q));
      searchResult.innerHTML = hit ? `<strong>Reported:</strong> Yes • <span style="color:#64748b">Report ID ${esc(hit.report_id)}</span>`
                                  : `<strong>Reported:</strong> Not found in demo registry`;
    });
  }

  function row(r){
    return `<tr>
      <td>${esc(r.report_id)}</td>
      <td><span class="badge"><span class="coin"></span>${esc(r.coin||"USDC")}</span></td>
      <td>${esc((r.reported_wallets||[])[0]||"")}</td>
      <td>${esc(r.status||"Submitted")}</td>
    </tr>`;
  }
  function seed(){
    const s=[
      {report_id:"5/0002", coin:"BTC", reported_wallets:["1KFjurbL…"], status:"23 minutes ago"},
      {report_id:"5/0001", coin:"ETH", reported_wallets:["0xabc1234e5…"], status:"1 hour ago"},
      {report_id:"5/0005", coin:"ETH", reported_wallets:["0xf17aab3c…"], status:"2 hours ago"},
      {report_id:"5/0095", coin:"BTC", reported_wallets:["bc1qpbna…"], status:"4 hours ago"},
    ];
    localStorage.setItem("wr_demo_reports", JSON.stringify(s));
    return s;
  }
  function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
})();
// ---- Wallet Reporters: demo submit handler (no-form pages) ----
(function () {
  function findWalletInput() {
    // Try common patterns: id/name/placeholder contains "wallet" or "address"
    const candidates = Array.from(document.querySelectorAll("input, textarea"));
    return (
      candidates.find((el) => /wallet/i.test(el.id || "")) ||
      candidates.find((el) => /wallet/i.test(el.name || "")) ||
      candidates.find((el) => /wallet/i.test(el.placeholder || "")) ||
      candidates.find((el) => /address/i.test(el.id || "")) ||
      candidates.find((el) => /address/i.test(el.name || "")) ||
      candidates.find((el) => /address/i.test(el.placeholder || ""))
    );
  }

  function findEmailInput() {
    return (
      document.querySelector('input[type="email"]') ||
      Array.from(document.querySelectorAll("input")).find((el) => /email/i.test(el.id || "")) ||
      Array.from(document.querySelectorAll("input")).find((el) => /email/i.test(el.name || "")) ||
      Array.from(document.querySelectorAll("input")).find((el) => /email/i.test(el.placeholder || ""))
    );
  }

  function findMessageInput() {
    const candidates = Array.from(document.querySelectorAll("textarea, input"));
    return (
      candidates.find((el) => /message/i.test(el.id || "")) ||
      candidates.find((el) => /details/i.test(el.id || "")) ||
      candidates.find((el) => /describe/i.test(el.placeholder || "")) ||
      candidates.find((el) => /message/i.test(el.placeholder || "")) ||
      null
    );
  }

  function findSubmitButton() {
    // Pick the most likely "submit" button by its visible text
    const buttons = Array.from(document.querySelectorAll("button, input[type='button'], input[type='submit']"));
    return (
      buttons.find((b) => /submit/i.test(b.textContent || b.value || "")) ||
      buttons.find((b) => /report/i.test(b.textContent || b.value || "")) ||
      buttons.find((b) => /send/i.test(b.textContent || b.value || "")) ||
      null
    );
  }

  async function submitReport() {
    const apiBase = window.WR_API_BASE;
    if (!apiBase) {
      alert("WR_API_BASE is not set.");
      return;
    }

    const walletEl = findWalletInput();
    const emailEl = findEmailInput();
    const msgEl = findMessageInput();

    const wallet_address = (walletEl && walletEl.value ? String(walletEl.value) : "").trim();
    const email = (emailEl && emailEl.value ? String(emailEl.value) : "").trim();
    const message = (msgEl && msgEl.value ? String(msgEl.value) : "").trim();

    if (!wallet_address) {
      alert("Please enter a wallet address.");
      return;
    }
    if (!email) {
      alert("Please enter an email (demo only).");
      return;
    }

    const payload = {
      wallet_address,
      email,
      message,
      url: window.location.href,
      category: "demo"
    };

    try {
      const res = await fetch(apiBase.replace(/\/$/, "") + "/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        console.error("Submit failed:", res.status, data);
        alert("Submit failed. Check console for details.");
        return;
      }

      console.log("Submitted:", data);
      alert("Submitted! Thank you.");
    } catch (e) {
      console.error("Submit error:", e);
      alert("Submit failed (network error). Check console.");
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    const btn = findSubmitButton();
    if (!btn) {
      console.warn("Wallet Reporters: could not find submit button.");
      return;
    }

    // Avoid double-wiring
    if (btn.__wrBound) return;
    btn.__wrBound = true;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      submitReport();
    });

    console.log("Wallet Reporters: submit handler attached to:", btn);
  });
})();
