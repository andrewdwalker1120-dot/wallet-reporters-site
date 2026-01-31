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
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
  });
});
