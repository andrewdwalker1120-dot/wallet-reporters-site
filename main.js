(() => {
  const modal = document.getElementById("wrModal");
  const openBtns = [
    document.getElementById("openReport"),
    document.getElementById("openReport2"),
    ...Array.from(document.querySelectorAll(".openReportAny")),
  ].filter(Boolean);

  function openModal() {
    if (!modal) return;
    modal.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      const first = modal.querySelector("input, select, textarea, button");
      if (first) first.focus();
    }, 50);
  }
  function closeModal() {
    if (!modal) return;
    modal.setAttribute("aria-hidden","true");
    document.body.style.overflow = "";
  }

  openBtns.forEach(b => b.addEventListener("click", openModal));
  modal?.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.matches("[data-close]")) closeModal();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.getAttribute("aria-hidden")==="false") closeModal();
  });

  // Demo registry rendering
  const recentTable = document.getElementById("recentTable");
  if (recentTable) {
    const demo = JSON.parse(localStorage.getItem("wr_demo_reports") || "[]");
    const rows = ['<div class="tr"><div class="td">Report ID</div><div class="td">Reported Wallet</div><div class="td">Status</div></div>'];
    demo.slice().reverse().slice(0,8).forEach(r => {
      rows.push(`<div class="tr"><div class="td">${esc(r.report_id)}</div><div class="td">${esc((r.reported_wallets||[])[0]||"")}</div><div class="td">${esc(r.status||"Submitted")}</div></div>`);
    });
    recentTable.innerHTML = rows.join("");
  }

  const searchBtn = document.getElementById("searchBtn");
  const searchWallet = document.getElementById("searchWallet");
  const searchResult = document.getElementById("searchResult");
  if (searchBtn && searchWallet && searchResult) {
    searchBtn.addEventListener("click", () => {
      const q = (searchWallet.value||"").trim().toLowerCase();
      if (!q) { searchResult.textContent = "Paste a wallet address to search."; return; }
      const demo = JSON.parse(localStorage.getItem("wr_demo_reports") || "[]");
      const hit = demo.find(r => (r.reported_wallets||[]).some(w => (w||"").toLowerCase() === q));
      searchResult.innerHTML = hit
        ? `<strong>Reported:</strong> Yes • <span class="muted">Report ID ${esc(hit.report_id)}</span>`
        : `<strong>Reported:</strong> Not found in demo registry`;
    });
  }

  function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
})();