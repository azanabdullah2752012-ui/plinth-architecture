/**
 * KÖNIG & SÖHNE // Atelier d'Horlogerie
 * Main Interaction Controller & Commission Configurator
 */

document.addEventListener('DOMContentLoaded', () => {
  const caliber = new CaliberSimulator('caliber-canvas');

  // --- Case Material Selector ---
  const materialBtns = document.querySelectorAll('.material-pill');
  materialBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      materialBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      caliber.setMaterial(btn.dataset.material);
    });
  });

  // --- View Mode Toggle (Skeleton vs. Guilloché) ---
  const viewBtns = document.querySelectorAll('.view-toggle-btn');
  viewBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      caliber.setViewMode(btn.dataset.view);
    });
  });

  // --- Winding Crown Button ---
  const crownBtn = document.getElementById('btn-wind-crown');
  crownBtn?.addEventListener('click', () => {
    caliber.windCrown(14.0);
    crownBtn.classList.add('is-winding');
    setTimeout(() => crownBtn.classList.remove('is-winding'), 250);
  });

  // --- Dead-Beat Seconds Toggle ---
  const deadBeatBtn = document.getElementById('btn-toggle-deadbeat');
  deadBeatBtn?.addEventListener('click', () => {
    const isDeadBeat = caliber.toggleDeadBeat();
    deadBeatBtn.classList.toggle('is-engaged', isDeadBeat);
    deadBeatBtn.querySelector('.btn-state').textContent = isDeadBeat ? 'DEAD-BEAT (1 HZ)' : 'SWEEP (4 HZ)';
  });

  // --- Chronograph Pusher ---
  const chronoBtn = document.getElementById('btn-chrono-pusher');
  const chronoResetBtn = document.getElementById('btn-chrono-reset');

  chronoBtn?.addEventListener('click', () => {
    const running = caliber.toggleChronograph();
    chronoBtn.classList.toggle('is-running', running);
    chronoBtn.querySelector('.btn-state').textContent = running ? 'STOP TIMING' : 'START CHRONO';
  });

  chronoResetBtn?.addEventListener('click', () => {
    caliber.resetChronograph();
    chronoBtn.classList.remove('is-running');
    chronoBtn.querySelector('.btn-state').textContent = 'START CHRONO';
  });

  // --- Commission Bespoke Timepiece Form Calculator ---
  const commissionForm = document.getElementById('commission-form');
  const commissionSummary = document.getElementById('commission-summary');
  const estimateLeadTime = document.getElementById('estimate-lead-time');
  const estimateDeposit = document.getElementById('estimate-deposit');

  function calculateCommission() {
    const material = document.querySelector('input[name="cfg-metal"]:checked')?.value || 'titanium';
    const complication = document.querySelector('input[name="cfg-complication"]:checked')?.value || 'three_hand';
    const strap = document.getElementById('cfg-strap')?.value || 'alligator';

    let baseWeeks = 16;
    let deposit = 4200;

    if (material === 'rose_gold') {
      baseWeeks += 4;
      deposit += 3600;
    } else if (material === 'obsidian') {
      baseWeeks += 2;
      deposit += 1200;
    }

    if (complication === 'chronograph') {
      baseWeeks += 8;
      deposit += 4800;
    } else if (complication === 'dead_beat') {
      baseWeeks += 6;
      deposit += 3200;
    }

    if (estimateLeadTime) estimateLeadTime.textContent = `${baseWeeks} WEEKS ATELIER BUILD`;
    if (estimateDeposit) estimateDeposit.textContent = `€${deposit.toLocaleString()} RESERVATION DEPOSIT`;
  }

  document.querySelectorAll('input[name="cfg-metal"], input[name="cfg-complication"], #cfg-strap').forEach((el) => {
    el.addEventListener('change', calculateCommission);
  });

  commissionForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const collectorName = document.getElementById('collector-name')?.value || 'Collector';
    const registryNumber = `KS-${Math.floor(1000 + Math.random() * 9000)}`;

    const confirmationBox = document.getElementById('commission-confirmation');
    if (confirmationBox) {
      confirmationBox.innerHTML = `
        <div class="confirmation-card">
          <div class="confirm-badge">REGISTRY ENTRY FILED</div>
          <h3 class="confirm-title">ALLOCATION RESERVED FOR ${collectorName.toUpperCase()}</h3>
          <p class="confirm-meta">CALIBER COMMISSION NUMBER: <strong>${registryNumber}</strong></p>
          <p class="confirm-text">Master Watchmaker Johannes König will prepare your movement blueprint folio. Our concierge will contact you within one business day for personal wrist measurement and bespoke engraving options.</p>
        </div>
      `;
      confirmationBox.classList.remove('is-hidden');
      commissionForm.style.display = 'none';
    }
  });

  calculateCommission();
});
