(() => {
  const mount = document.getElementById("wallet-reporters-widget");
  if (!mount) return;

  const state = { mode:"police", wallets:[""], wallet_dates:[""], policeHasReport:true };
  mount.innerHTML = render();
  bind();

  function render(){
    return `
    <div class="wr-widget">
      <div class="wr-tabs" role="tablist" aria-label="Report type">
        ${tab("police","I have a police report (Free)")}
        ${tab("paid","I don’t have a police report (Paid – 100 USDC)")}
        ${tab("atm","I deposited cash into a crypto ATM")}
      </div>

      ${sectionReportedWallets()}
      ${sectionYourWalletAndTx()}
      ${state.mode==="police" ? sectionPolice() : ""}
      ${state.mode==="paid" ? sectionPaid() : ""}
      ${state.mode==="atm" ? sectionAtm() : ""}

      ${sectionAbuseAndConfirm()}
      ${sectionDisclaimers()}

      <div class="wr-actions">
        <button class="btn btn-primary" id="wrSubmit">${primaryLabel()}</button>
      </div>

      <div id="wrReceipt" class="wr-section" style="display:none;"></div>
    </div>`;
  }

  function tab(mode,label){
    const selected = state.mode===mode ? "true":"false";
    return `<button class="wr-tab" role="tab" aria-selected="${selected}" data-mode="${mode}">${label}</button>`;
  }

  function sectionReportedWallets(){
    const rows = state.wallets.map((v,i)=>`
      <div class="wr-field">
        <label class="wr-label">Reported wallet address #${i+1} ${i===0?"(required)":""}</label>
        <input class="wr-input" data-wallet-idx="${i}" value="${attr(v)}" placeholder="0x… or other chain format" />
        <div class="wr-help">Enter the wallet address you sent funds to.</div>
      </div>
      <div class="wr-field">
        <label class="wr-label">Date of first interaction (optional)</label>
        <input class="wr-input" type="date" data-wallet-date-idx="${i}" value="${attr(state.wallet_dates[i]||"")}" />
        <div class="wr-help">If known, this helps generate better tracing seed data.</div>
      </div>
      <hr style="border:none;border-top:1px solid #e6eaf2;margin:10px 0;">
    `).join("");
    return `<div class="wr-section"><div class="wr-section-title">Reported wallet(s)</div>${rows}
      <button class="btn btn-ghost" id="wrAddWallet">+ Add another wallet</button></div>`;
  }

  function sectionYourWalletAndTx(){
    const txHelp = state.mode==="atm" ? "Required for ATM reports." : "Optional but helpful for verification and tracing.";
    return `<div class="wr-section"><div class="wr-section-title">Your information</div>
      <div class="wr-field">
        <label class="wr-label">Your wallet address (required)</label>
        <input class="wr-input" id="wrYourWallet" placeholder="Your wallet address" />
        <div class="wr-help">Used only to link your report to real blockchain activity. We will never ask for private keys.</div>
      </div>
      <div class="wr-field">
        <label class="wr-label">Transaction hash ${state.mode==="atm"?"(required)":"(optional)"}</label>
        <input class="wr-input" id="wrTxHash" placeholder="0x… transaction hash" />
        <div class="wr-help">${txHelp}</div>
      </div></div>`;
  }

  function sectionPolice(){
    return `<div class="wr-section"><div class="wr-section-title">Police report (free path)</div>
      <div class="wr-inline">
        <div class="wr-field"><label class="wr-label">Country</label>
          <select class="wr-select" id="wrCountry">
            <option value="">Select…</option><option>Canada</option><option>United States</option><option>United Kingdom</option><option>Australia</option><option>Other</option>
          </select></div>
        <div class="wr-field"><label class="wr-label">State / Province</label><input class="wr-input" id="wrState" placeholder="e.g., Ontario" /></div>
        <div class="wr-field"><label class="wr-label">City</label><input class="wr-input" id="wrCity" placeholder="e.g., Toronto" /></div>
      </div>
      <div class="wr-field"><label class="wr-label">Police department</label><input class="wr-input" id="wrDept" placeholder="Search or select a department" />
        <div class="wr-help">For production: replace this with a real department directory search.</div></div>
      <div class="wr-field"><label class="wr-label">Police report number (required)</label><input class="wr-input" id="wrPoliceReport" placeholder="e.g., 2026-123456" /></div>
      <div class="wr-field"><label class="wr-label">Investigating officer’s email (optional)</label><input class="wr-input" id="wrOfficerEmail" placeholder="officer@police.gov" />
        <div class="wr-help">Used only to deliver an automated report. We do not contact police departments or officers directly.</div></div>
      <div class="wr-field"><label class="wr-label">CAFC report number (optional)</label><input class="wr-input" id="wrCafc" placeholder="Optional (Canada)" /></div>
      <div class="wr-field"><label class="wr-label">Case notes (optional)</label><textarea class="wr-input" id="wrNotes" rows="3" placeholder="Optional notes…"></textarea></div>
    </div>`;
  }

  function sectionPaid(){
    return `<div class="wr-section"><div class="wr-section-title">Paid report (100 USDC)</div>
      <div class="wr-danger"><strong>We encourage you to report to police first.</strong><br>
        We don’t really want your money. A police report gives authorities the best chance to act and helps protect others.</div>
      <div class="wr-field"><label class="wr-label">Reason you can’t file a police report (optional)</label>
        <select class="wr-select" id="wrReason">
          <option value="">Select…</option><option>Not sure how to file</option><option>Embarrassed</option><option>Outside jurisdiction</option><option>Other</option>
        </select></div>
      <div class="wr-field"><label class="wr-label">Identity verification (required)</label>
        <div class="wr-checkbox"><input type="checkbox" id="wrKycConfirm">
          <div><span style="font-weight:900;">I will complete third-party identity verification (e.g., Plaid)</span>
          <div class="wr-help">We do not receive or store your personal identity data from third-party verification providers.</div></div></div>
      </div>
      <div class="wr-help">Payment integration is stubbed in this demo. Wire USDC payment later.</div>
    </div>`;
  }

  function sectionAtm(){
    return `<div class="wr-section"><div class="wr-section-title">Crypto ATM report</div>
      <div class="wr-field"><label class="wr-label">ATM receipt upload (required)</label>
        <input class="wr-input" id="wrReceiptFile" type="file" accept="image/*,.pdf" />
        <div class="wr-help">Upload a photo or PDF of the ATM receipt.</div></div>
      <div class="wr-field"><label class="wr-label">Do you have a police report?</label>
        <select class="wr-select" id="wrAtmHasPolice">
          <option value="yes">Yes (Free)</option>
          <option value="no">No (Paid – 100 USDC)</option>
        </select></div>
      <div id="wrAtmPoliceFields"></div>
    </div>`;
  }

  function sectionAbuseAndConfirm(){
    return `<div class="wr-section"><div class="wr-section-title">Verification</div>
      <div class="wr-field"><label class="wr-label">CAPTCHA (placeholder)</label>
        <div class="wr-help">Integrate Cloudflare Turnstile here for production.</div>
        <div style="border:1px dashed #cbd5e1;border-radius:12px;padding:12px;color:#64748b;">[Turnstile CAPTCHA]</div>
      </div>
      <div class="wr-checkbox"><input type="checkbox" id="wrTruth"><div><span style="font-weight:900;">I confirm this report is based on a real blockchain transaction and is truthful to the best of my knowledge.</span></div></div>
    </div>`;
  }

  function sectionDisclaimers(){
    return `<div class="wr-section"><div class="wr-section-title">Important Disclaimers</div>
      <div class="wr-help" style="font-size:13px;">
        Wallet Reporters is an automated reporting and tracing system.<br>
        • We do <strong>not</strong> recover funds.<br>
        • We do <strong>not</strong> provide investment advice.<br>
        • We do <strong>not</strong> offer private investigations.<br>
        • We do <strong>not</strong> ask for private keys or recovery phrases.<br>
        • We do <strong>not</strong> cold-contact victims.<br><br>
        Reports submitted through this system generate <strong>automated blockchain tracing reports only</strong>.<br>
        We do <strong>not</strong> contact police departments or investigating officers directly.<br>
        A reported wallet does <strong>not</strong> imply wrongdoing; it indicates a wallet has been submitted for review.<br><br>
        Identity verification (when required) is performed by third-party providers. We do not receive or store personal identity data from those services.
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
        const m=t.getAttribute("data-mode");
        if (m===state.mode) return;
        state.mode=m;
        if (state.mode==="atm") state.policeHasReport=true;
        rerender();
      }
      if (t?.id==="wrAddWallet"){
        state.wallets.push("");state.wallet_dates.push("");rerender();
      }
      if (t?.id==="wrSubmit") submit();
    });

    mount.addEventListener("input",(e)=>{
      const t=e.target; if (!t) return;
      const wi=t.getAttribute("data-wallet-idx");
      if (wi!==null) state.wallets[Number(wi)] = t.value;
      const wd=t.getAttribute("data-wallet-date-idx");
      if (wd!==null) state.wallet_dates[Number(wd)] = t.value;
    });

    mount.addEventListener("change",(e)=>{
      const t=e.target; if (!t) return;
      if (t.id==="wrAtmHasPolice"){ state.policeHasReport = t.value==="yes"; rerender(); }
    });
  }

  function rerender(){
    mount.innerHTML = render();
    if (state.mode==="atm"){
      const holder=document.getElementById("wrAtmPoliceFields");
      if (!holder) return;
      if (state.policeHasReport){
        holder.innerHTML = `
          <div class="wr-field"><label class="wr-label">Police report number (required for free)</label>
            <input class="wr-input" id="wrPoliceReport" placeholder="e.g., 2026-123456" /></div>
          <div class="wr-field"><label class="wr-label">Investigating officer’s email (optional)</label>
            <input class="wr-input" id="wrOfficerEmail" placeholder="officer@police.gov" />
            <div class="wr-help">Used only to deliver an automated report. We do not contact police departments or officers directly.</div></div>`;
      } else {
        holder.innerHTML = `
          <div class="wr-danger"><strong>We encourage you to report to police first.</strong><br>
            We don’t really want your money. A police report gives authorities the best chance to act and helps protect others.</div>
          <div class="wr-field" style="margin-top:10px;"><label class="wr-label">Identity verification (required)</label>
            <div class="wr-checkbox"><input type="checkbox" id="wrKycConfirm">
              <div><span style="font-weight:900;">I will complete third-party identity verification (e.g., Plaid)</span>
                <div class="wr-help">We do not receive or store your personal identity data from third-party verification providers.</div></div></div></div>`;
      }
    }
  }

  function submit(){
    const errors=[];
    const reported = state.wallets.map(w=>(w||"").trim()).filter(Boolean);
    if (!reported.length) errors.push("Enter at least one reported wallet address.");
    const yourWallet=(document.getElementById("wrYourWallet")?.value||"").trim();
    if (!yourWallet) errors.push("Your wallet address is required.");
    const txHash=(document.getElementById("wrTxHash")?.value||"").trim();
    if (state.mode==="atm" && !txHash) errors.push("Transaction hash is required for ATM reports.");
    if (!document.getElementById("wrTruth")?.checked) errors.push("You must confirm the report is truthful and based on a real transaction.");

    if (state.mode==="police"){
      if (!(document.getElementById("wrPoliceReport")?.value||"").trim()) errors.push("Police report number is required for the free path.");
    }
    if (state.mode==="paid"){
      if (!document.getElementById("wrKycConfirm")?.checked) errors.push("Identity verification confirmation is required for paid reports.");
    }
    if (state.mode==="atm"){
      if (!document.getElementById("wrReceiptFile")?.files?.length) errors.push("ATM receipt upload is required.");
      if (state.policeHasReport){
        if (!(document.getElementById("wrPoliceReport")?.value||"").trim()) errors.push("Police report number is required for free ATM reports.");
      } else {
        if (!document.getElementById("wrKycConfirm")?.checked) errors.push("Identity verification confirmation is required for paid ATM reports.");
      }
    }

    if (errors.length){ alert(errors.join("\n")); return; }

    const report = {
      report_id: "WR-" + Math.random().toString(16).slice(2,10).toUpperCase(),
      submitted_at: new Date().toISOString(),
      mode: state.mode==="atm" ? (state.policeHasReport ? "atm_free":"atm_paid") : state.mode,
      reported_wallets: reported,
      status: "Submitted (Demo)"
    };
    const existing = JSON.parse(localStorage.getItem("wr_demo_reports") || "[]");
    existing.push(report);
    localStorage.setItem("wr_demo_reports", JSON.stringify(existing));

    const receipt=document.getElementById("wrReceipt");
    if (receipt){
      receipt.style.display="block";
      receipt.innerHTML = `<div class="wr-section-title">Receipt</div>
        <div class="wr-help" style="font-size:13px;">
          <strong>Report ID:</strong> ${esc(report.report_id)}<br>
          <strong>Status:</strong> ${esc(report.status)}<br>
          <strong>Reported wallet(s):</strong> ${esc(report.reported_wallets.join(", "))}<br><br>
          <em>Demo mode:</em> This starter package stores reports in your browser (localStorage). Connect to your Cloudflare Worker/API later.
        </div>`;
      receipt.scrollIntoView({behavior:"smooth", block:"nearest"});
    }
  }

  function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function attr(s){return String(s??"").replace(/"/g,"&quot;");}
})();