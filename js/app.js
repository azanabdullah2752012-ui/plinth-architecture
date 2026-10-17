/**
 * MONOLITH // Application Coordinator & Studio Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  const monolith = new Monolith3D('monolith-3d-container');
  const acousticSim = new AcousticFieldSimulator('acoustic-canvas');

  // --- Finish Switcher ---
  const finishPills = document.querySelectorAll('.finish-pill');
  const finishLabel = document.getElementById('current-finish-title');

  const finishNames = {
    silver: 'RAW BILLET 6061-T6 ALUMINUM // BEAD-BLASTED SATIN',
    obsidian: 'STEALTH ANODIZED OBSIDIAN // MATTE CARBON COAT',
    champagne: 'CHAMPAGNE TITANIUM NITRIDE // PVD HAND-BRUSHED'
  };

  finishPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      finishPills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      const finish = pill.dataset.finish;
      monolith.setFinish(finish);
      if (finishLabel) finishLabel.textContent = finishNames[finish];
    });
  });

  // --- Exploded View Toggle ---
  const explodeBtn = document.getElementById('btn-toggle-explode');
  explodeBtn?.addEventListener('click', () => {
    const isExploded = monolith.toggleExploded();
    explodeBtn.classList.toggle('is-active', isExploded);
    explodeBtn.querySelector('.btn-label').textContent = isExploded ? 'ASSEMBLE CHASSIS' : 'EXPLODE ARCHITECTURE';
  });

  // --- Acoustic Wave Simulator Controls ---
  const freqSlider = document.getElementById('wave-freq-slider');
  const freqReadout = document.getElementById('wave-freq-readout');
  freqSlider?.addEventListener('input', (e) => {
    const hz = parseInt(e.target.value, 10);
    acousticSim.setFrequency(hz);
    if (freqReadout) freqReadout.textContent = `${hz} Hz`;
  });

  const roomBtns = document.querySelectorAll('.room-toggle-btn');
  roomBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      roomBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const refl = parseFloat(btn.dataset.reflection);
      acousticSim.setWallReflection(refl);
    });
  });

  // --- Custom Configurator & Order Allocation ---
  const orderForm = document.getElementById('monolith-config-form');
  const configWeight = document.getElementById('cfg-weight');
  const configPrice = document.getElementById('cfg-price');

  function updateConfig() {
    const finish = document.querySelector('input[name="cfg-metal"]:checked')?.value || 'silver';
    const tweeter = document.querySelector('input[name="cfg-tweeter"]:checked')?.value || 'beryllium';
    const plinth = document.getElementById('cfg-plinth')?.value || 'aluminum';

    let basePrice = 14500;
    let weight = 42.0;

    if (finish === 'champagne') basePrice += 2200;
    if (finish === 'obsidian') basePrice += 1100;

    if (tweeter === 'diamond') {
      basePrice += 3800;
    }

    if (plinth === 'granite') weight += 18.5;
    if (plinth === 'brass') weight += 14.0;

    if (configPrice) configPrice.textContent = `$${basePrice.toLocaleString()} USD / PAIR`;
    if (configWeight) configWeight.textContent = `${weight.toFixed(1)} KG TOTAL MASS`;
  }

  document.querySelectorAll('input[name="cfg-metal"], input[name="cfg-tweeter"], #cfg-plinth').forEach((el) => {
    el.addEventListener('change', updateConfig);
  });

  orderForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('client-name')?.value || 'Client';
    const allocId = `MN-${Math.floor(100 + Math.random() * 900)}-${Date.now().toString().slice(-4)}`;

    const confirmBox = document.getElementById('order-confirmation');
    if (confirmBox) {
      confirmBox.innerHTML = `
        <div class="confirm-card">
          <div class="confirm-badge">ALLOCATION REGISTERED // BATCH 04</div>
          <h3 class="confirm-title">RESERVATION SECURED FOR ${name.toUpperCase()}</h3>
          <p class="confirm-id">MONOLITH CHASSIS SERIAL: <strong>${allocId}</strong></p>
          <p class="confirm-desc">Your unibody billet chassis will be individually CNC machined in Zurich. Acoustic calibration report and laser-etched serial documentation will be dispatched to your concierge.</p>
        </div>
      `;
      confirmBox.classList.remove('is-hidden');
      orderForm.style.display = 'none';
    }
  });

  updateConfig();
});
