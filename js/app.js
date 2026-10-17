/**
 * GRID // 01 — Application Coordinator & Keyboard Binding
 */

document.addEventListener('DOMContentLoaded', () => {
  const device = new GridDeviceSimulator();

  // Keyboard binding to on-screen physical hardware keys!
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    const keyElMap = {
      'Digit1': 'k1',
      'Digit2': 'k2',
      'Digit3': 'k3',
      'Digit4': 'k4',
      'Digit5': 'k5',
      'Digit6': 'k6',
      'Space': 'k5'
    };

    const targetKeyId = keyElMap[e.code];
    if (targetKeyId) {
      e.preventDefault();
      const keyEl = document.querySelector(`.hw-key[data-key="${targetKeyId}"]`);
      if (keyEl) {
        keyEl.classList.add('is-pressed');
        device.handleKeyPress(targetKeyId);
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    document.querySelectorAll('.hw-key').forEach(k => k.classList.remove('is-pressed'));
  });

  // Pre-order Modal & Drawer
  const preOrderBtn = document.getElementById('btn-preorder');
  const modal = document.getElementById('preorder-modal');
  const closeModalBtn = document.getElementById('btn-close-modal');
  const preOrderForm = document.getElementById('preorder-form');
  const confirmBox = document.getElementById('preorder-confirmed');

  preOrderBtn?.addEventListener('click', () => {
    modal?.classList.remove('is-hidden');
  });

  closeModalBtn?.addEventListener('click', () => {
    modal?.classList.add('is-hidden');
  });

  preOrderForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('client-email')?.value || 'backer@domain.com';
    const batchId = `GR-01-${Math.floor(1000 + Math.random() * 9000)}`;

    if (confirmBox) {
      confirmBox.innerHTML = `
        <div class="confirm-pill">BATCH 01 ALLOCATION CONFIRMED</div>
        <h3 class="confirm-heading">UNIT RESERVED: ${batchId}</h3>
        <p class="confirm-sub">Confirmation sent to <strong>${email}</strong>. Target dispatch: July 2026. Zero upfront charge until dispatch inspection.</p>
      `;
      confirmBox.classList.remove('is-hidden');
      preOrderForm.style.display = 'none';
    }
  });
});
