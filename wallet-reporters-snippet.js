(() => {
  const mount = document.getElementById("wallet-reporters-widget");
  if (!mount) return;

  const state = { mode:"police", wallets:[""], wallet_dates:[""], policeHasReport:true };
  mount.innerHTML = render();
  bind();
  rerenderAtmFields();

  function render(){
    return `
    <div class="wr-widget">
      <div class="wr-tabs" role="tablist" aria-label="Report type">
        ${tab("police","I have a police report (Free)")}
        ${tab("paid","No police report (Paid – 100 USDC)")}
        ${tab("atm","Crypto ATM deposit")}
      </div>

      ${sectionWallets()}
      ${sectionYour()}
      ${state.mode==="police" ? sectionPolice() : ""}
      ${state.mode==="paid" ? sectionPaid() : ""}
      ${state.mode==="atm" ? sectionAtm() : ""}

      ${sectionCaptcha()}
      ${sectionDisclaimers()}

      <div class="wr-actions">
        <button class="btn btn-dark" id="wrSubmit">${primaryLabel()}</button>
      </div>
      <div id="wrReceipt" class="wr-section" style="display:none;"></div>
    </div>`;
  }

  function tab(mode,label){
    const sel = state.mode===mode ? "true":"false";
    return `<button class="wr-tab" role="tab" aria-selected="${sel}" data-mode="${mode}">${label}</button>`;
  }

  function sectionWallets(){
    const rows = state.wallets.map((v,i)=>`
      <div class="wr-field">
        <label class="wr-label">Reported wallet address #${i+1} ${i===0?"(required)":""}</label>
        <input class="wr-input" data-wallet-idx="${i}" value="${attr(v)}" placeholder="0x… or other chain format" />
        <div class="wr-help">Enter the wallet address(es) you sent funds to.</div>
      </div>
      <div class="wr-field">
        <label class="wr-label">Date of first interaction (optional)</label>
        <input class="wr-input" type="date" data-wallet-date-idx="${i}" value="${attr(state.wallet_dates[i]||"")}" />
      </div>
      <hr style="border:none;border-top:1px solid #eef2ff;margin:10px 0;">
    `).join("");
    return `<div class="wr-section"><div class="wr-section-title">Scammer wallet(s)</div>${rows}
      <button class="btn" type="button" id="wrAddWallet">+ Add another wallet</button>
    </div>`;
  }

  function sectionYour(){
    const txReq = state.mode==="atm" ? "(required)" : "(optional)";
    return `<div class="wr-section"><div class="wr-section-title">Your info</div>
      <div class="wr-field">
        <label class="wr-label">Your wallet address (required)</label>
        <input class="wr-input" id="wrYourWallet" placeholder="Your wallet address" />
        <div class="wr-help">We will never ask for private keys or seed phrases.</div>
      </div>
      <div class="wr-field">
        <label class="wr-label">Transaction hash ${txReq}</label>
        <input class="wr-input" id="wrTxHash" placeholder="0x… transaction hash" />
      </div>
    </div>`;
  }

  function sectionPolice(){
    return `<div class="wr-section"><div class="wr-section-title">Police report (free)</div>
      <div class="wr-inline">
        <div class="wr-field"><label class="wr-label">Country</label><input class="wr-input" id="wrCountry" placeholder="Canada"/></div>
        <div class="wr-field"><label class="wr-label">State/Province</label><input class="wr-input" id="wrState" placeholder="Ontario"/></div>
        <div class="wr-field"><label class="wr-label">City</label><input class="wr-input" id="wrCity" placeholder="Toronto"/></div>
      </div>
      <div class="wr-field"><label class="wr-label">Police department</label><input class="wr-input" id="wrDept" placeholder="Search or select"/></div>
      <div class="wr-field"><label class="wr-label">Police report number (required)</label><input class="wr-input" id="wrPoliceReport" placeholder="2026-123456"/></div>
      <div class="wr-field"><label class="wr-label">Investigating officer email (optional)</label><input class="wr-input" id="wrOfficerEmail" placeholder="officer@police.gov"/>
        <div class="wr-help">Reports are sent automatically. We do not contact departments/officers directly.</div>
      </div>
    </div>`;
  }

  function sectionPaid(){
    return `<div class="wr-section"><div class="wr-section-title">Paid report (100 USDC)</div>
      <div class="wr-danger"><strong>We encourage you to report to police first.</strong><br>
      We don’t really want your money. A police report gives authorities the best chance to act and helps protect others.</div>
      <div class="wr-field" style="margin-top:10px;"><label class="wr-label">Identity verification (required)</label>
        <div class="wr-checkbox"><input type="checkbox" id="wrKycConfirm"><div>
          <strong>I will complete third-party identity verification (e.g., Plaid)</strong>
          <div class="wr-help">We do not receive or store personal identity data from third parties.</div>
        </div></div>
      </div>
    </div>`;
  }

  function sectionAtm(){
    return `<div class="wr-section"><div class="wr-section-title">Crypto ATM deposit</div>
      <div class="wr-field"><label class="wr-label">ATM receipt upload (required)</label><input class="wr-input" id="wrReceiptFile" type="file" accept="image/*,.pdf"/></div>
      <div class="wr-field"><label class="wr-label">Do you have a police report?</label>
        <select class="wr-select" id="wrAtmHasPolice">
          <option value="yes">Yes (Free)</option>
          <option value="no">No (Paid – 100 USDC)</option>
        </select>
      </div>
      <div id="wrAtmFields"></div>
    </div>`;
  }

  function sectionCaptcha(){
    return `<div class="wr-section"><div class="wr-section-title">Verification</div>
      <div class="wr-field">
        <label class="wr-label">CAPTCHA (placeholder)</label>
        <div class="wr-help">Integrate Cloudflare Turnstile here.</div>
        <div style="border:1px dashed #cbd5e1;border-radius:12px;padding:12px;color:#64748b">[Turnstile CAPTCHA]</div>
      </div>
      <div class="wr-checkbox"><input type="checkbox" id="wrTruth"><div><strong>I confirm this report is truthful and based on a real transaction.</strong></div></div>
    </div>`;
  }

  function sectionDisclaimers(){
    return `<div class="wr-section"><div class="wr-section-title">Disclaimers</div>
      <div class="wr-help" style="font-size:13px">
        • We do <strong>not</strong> recover funds or offer recovery services.<br>
        • We do <strong>not</strong> ask for private keys or recovery phrases.<br>
        • We do <strong>not</strong> contact police departments or investigating officers directly — we send automated reports only.<br>
        • Identity verification (when required) is performed by third parties; we do not receive/store their personal identity data.
      </div>
    </div>`;
  }

  function primaryLabel(){
    if (state.mode==="police") return "Submit Report";
    if (state.mode==="paid") return "Pay 100 USDC & Submit";
    if (state.mode==="atm") return state.policeHasReport ? "Submit ATM Report (Free)" : "Pay 100 USDC & Submit ATM Report";
    return "Submit";
  }

  function bind(){
    mount.addEventListener("click",(e)=>{
      const t=e.target;
      if (t?.classList?.contains("wr-tab")){
        state.mode=t.getAttribute("data-mode");
        state.policeHasReport=true;
        mount.innerHTML = render(); rerenderAtmFields();
      }
      if (t?.id==="wrAddWallet"){
        state.wallets.push(""); state.wallet_dates.push("");
        mount.innerHTML = render(); rerenderAtmFields();
      }
      if (t?.id==="wrSubmit") submit();
    });
    mount.addEventListener("input",(e)=>{
      const t=e.target;
      const wi=t?.getAttribute?.("data-wallet-idx");
      if (wi!==null && wi!==undefined) state.wallets[Number(wi)] = t.value;
      const wd=t?.getAttribute?.("data-wallet-date-idx");
      if (wd!==null && wd!==undefined) state.wallet_dates[Number(wd)] = t.value;
    });
    mount.addEventListener("change",(e)=>{
      if (e.target?.id==="wrAtmHasPolice"){ state.policeHasReport = e.target.value==="yes"; rerenderAtmFields(); }
    });
  }

  function rerenderAtmFields(){
    if (state.mode!=="atm") return;
    const holder=document.getElementById("wrAtmFields");
    if (!holder) return;
    if (state.policeHasReport){
      holder.innerHTML = `<div class="wr-field"><label class="wr-label">Police report number (required)</label><input class="wr-input" id="wrPoliceReport" placeholder="2026-123456"/></div>
        <div class="wr-field"><label class="wr-label">Investigating officer email (optional)</label><input class="wr-input" id="wrOfficerEmail" placeholder="officer@police.gov"/></div>`;
    } else {
      holder.innerHTML = `<div class="wr-danger"><strong>We encourage you to report to police first.</strong> If you can, file a police report and use the free option.</div>
        <div class="wr-field" style="margin-top:10px;"><label class="wr-label">Identity verification (required)</label>
          <div class="wr-checkbox"><input type="checkbox" id="wrKycConfirm"><div><strong>I will complete third-party identity verification (e.g., Plaid)</strong></div></div>
        </div>`;
    }
  }

  function submit(){
    const errors=[];
    const reported = state.wallets.map(w=>(w||"").trim()).filter(Boolean);
    if (!reported.length) errors.push("Enter at least one scammer wallet address.");
    const yourWallet=(document.getElementById("wrYourWallet")?.value||"").trim();
    if (!yourWallet) errors.push("Your wallet address is required.");
    const tx=(document.getElementById("wrTxHash")?.value||"").trim();
    if (state.mode==="atm" && !tx) errors.push("Transaction hash is required for ATM reports.");
    if (!document.getElementById("wrTruth")?.checked) errors.push("Please confirm the report is truthful.");
    if (state.mode==="police" && !(document.getElementById("wrPoliceReport")?.value||"").trim()) errors.push("Police report number is required.");
    if (state.mode==="paid" && !document.getElementById("wrKycConfirm")?.checked) errors.push("Identity verification confirmation is required.");
    if (state.mode==="atm"){
      if (!document.getElementById("wrReceiptFile")?.files?.length) errors.push("ATM receipt upload is required.");
      if (!state.policeHasReport && !document.getElementById("wrKycConfirm")?.checked) errors.push("Identity verification confirmation is required for paid ATM reports.");
      if (state.policeHasReport && !(document.getElementById("wrPoliceReport")?.value||"").trim()) errors.push("Police report number is required for free ATM reports.");
    }
    if (errors.length){ alert(errors.join("\n")); return; }

    const report = { report_id:"WR-"+Math.random().toString(16).slice(2,10).toUpperCase(), coin:"USDC", reported_wallets:reported, status:"Just now" };
    const existing = JSON.parse(localStorage.getItem("wr_demo_reports") || "[]");
    existing.push(report);
    localStorage.setItem("wr_demo_reports", JSON.stringify(existing));

    const receipt=document.getElementById("wrReceipt");
    if (receipt){
      receipt.style.display="block";
      receipt.innerHTML = `<div class="wr-section-title">Submitted (Demo)</div>
        <div class="wr-help" style="font-size:13px"><strong>Report ID:</strong> ${esc(report.report_id)}<br>
        Saved locally for demo purposes. Connect to your backend later.</div>`;
    }
  }

  function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function attr(s){return String(s??"").replace(/"/g,"&quot;");}
})();