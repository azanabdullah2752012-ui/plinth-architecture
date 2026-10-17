/**
 * KÖNIG & SÖHNE // Application Coordinator & Studio Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  const watchStudio = new WatchStudio3D('watch-3d-viewport');

  // --- Material Metallurgy Switcher ---
  const materialPills = document.querySelectorAll('.metal-pill');
  const materialLabel = document.getElementById('current-metal-display');

  const materialNames = {
    rose_gold: '18K 4N ROSE GOLD // MIRROR-POLISHED BEZEL',
    titanium: 'GRADE 5 TITANIUM // SATIN-BRUSHED LUGS',
    obsidian: 'OBSIDIAN DLC COATING // MATTE OBSIDIAN',
    steel: '904L AUSTENITIC STEEL // BEVELED CHAMFERS'
  };

  materialPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      materialPills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      const mat = pill.dataset.material;
      watchStudio.setMaterial(mat);
      if (materialLabel) materialLabel.textContent = materialNames[mat];
    });
  });

  // --- Explode View Toggle ---
  const explodeBtn = document.getElementById('btn-toggle-explode');
  explodeBtn?.addEventListener('click', () => {
    const isExploded = watchStudio.toggleExploded();
    explodeBtn.classList.toggle('is-active', isExploded);
    explodeBtn.querySelector('.btn-label').textContent = isExploded ? 'ASSEMBLE CASE' : 'EXPLODE HOROLOGY';
  });

  // --- Crown Winding Action ---
  const crownBtn = document.getElementById('btn-wind-crown');
  crownBtn?.addEventListener('click', () => {
    watchStudio.windCrown(14);
    crownBtn.classList.add('is-winding');
    setTimeout(() => crownBtn.classList.remove('is-winding'), 250);
  });

  // --- Commission Bespoke Allocation Form ---
  const commissionForm = document.getElementById('watch-config-form');
  const quotePrice = document.getElementById('quote-price');
  const quoteLeadTime = document.getElementById('quote-lead');

  function calculateQuote() {
    const metal = document.querySelector('input[name="cfg-metal"]:checked')?.value || 'rose_gold';
    const complication = document.querySelector('input[name="cfg-complication"]:checked')?.value || 'three_hand';

    let basePrice = 38500;
    let weeks = 18;

    if (metal === 'rose_gold') {
      basePrice += 8500;
      weeks += 4;
    } else if (metal === 'obsidian') {
      basePrice += 3200;
      weeks += 2;
    } else if (metal === 'titanium') {
      basePrice += 2400;
    }

    if (complication === 'dead_beat') {
      basePrice += 6500;
      weeks += 6;
    } else if (complication === 'chronograph') {
      basePrice += 11000;
      weeks += 8;
    }

    if (quotePrice) quotePrice.textContent = `€${basePrice.toLocaleString()} EUR`;
    if (quoteLeadTime) quoteLeadTime.textContent = `${weeks} WEEKS ATELIER BUILD`;
  }

  document.querySelectorAll('input[name="cfg-metal"], input[name="cfg-complication"], #cfg-strap').forEach((el) => {
    el.addEventListener('change', calculateQuote);
  });

  commissionForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('client-name')?.value || 'Collector';
    const allocId = `KS-042-${Math.floor(100 + Math.random() * 900)}`;

    const confirmBox = document.getElementById('order-confirmation');
    if (confirmBox) {
      confirmBox.innerHTML = `
        <div class="confirm-card">
          <div class="confirm-badge">REGISTRY ENTRY CONFIRMED // BATCH 2026</div>
          <h3 class="confirm-title">ALLOCATION SECURED FOR ${name.toUpperCase()}</h3>
          <p class="confirm-id">CALIBER ARCHIVE SERIAL: <strong>${allocId}</strong></p>
          <p class="confirm-desc">Master Watchmaker Johannes König will prepare your movement blueprint folio. Our concierge will contact you within one business day for custom case engraving and private atelier reception in Glashütte.</p>
        </div>
      `;
      confirmBox.classList.remove('is-hidden');
      commissionForm.style.display = 'none';
    }
  });

  calculateQuote();
});
