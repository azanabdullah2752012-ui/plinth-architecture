/**
 * PLINTH — Atelier & Architectural Folio Interactions
 * Tactile Material Specimen Explorer, Blueprint Cutaway Switcher,
 * and Monograph Telemetry.
 */

(function () {
  'use strict';

  // ── 1. Interactive Material Specimen Explorer ──────────
  const materialData = {
    travertine: {
      title: 'In-Situ Lime Plaster & Travertine',
      origin: 'Mouraria Old Quarter, Lisbon · Local Quarry Block 4',
      compressive: '18.4 MPa',
      absorption: '0.04 cm³/(cm²·h)',
      embodiedCarbon: '42 kg CO₂e/m²',
      description: 'Hand-troweled lime wash over hydrated calcium carbonate stone. Breathes with Atlantic coastal humidity and reflects shifting afternoon light without synthetic gloss.',
      project: 'Casa Mouraria [PL-01]'
    },
    concrete: {
      title: 'Coffered In-Situ Basalt Concrete',
      origin: 'Leixões Terminal aggregate, Porto · Grade C35/45',
      compressive: '45.0 MPa',
      absorption: '0.015 cm³/(cm²·h)',
      embodiedCarbon: '110 kg CO₂e/m²',
      description: 'Slow-cured pozzolanic matrix cast inside horizontal rough-sawn pine formwork. Retains the grain of timber and acoustic mass required for monumental civic reading rooms.',
      project: 'Biblioteca Central [PL-02]'
    },
    marble: {
      title: 'Estremoz Rosa Honed Marble',
      origin: 'Estremoz Anticline, Alentejo · Open Pit 12',
      compressive: '95.2 MPa',
      absorption: '0.008 cm³/(cm²·h)',
      embodiedCarbon: '28 kg CO₂e/m²',
      description: 'Dense crystalline calcitic marble with subtle ferrous veining. Honed with 400-grit carborundum to create a warm, non-reflective velvety tactile floor plate.',
      project: 'Pátio das Flores [PL-03]'
    },
    brass: {
      title: 'Weathered Marine Architecture Brass',
      origin: 'Barreiro Foundry · Alloy CuZn37 Non-Lacquered',
      compressive: '380 MPa (Yield)',
      absorption: '0.000 (Impermeable)',
      embodiedCarbon: '64 kg CO₂e/kg',
      description: 'Raw cold-rolled brass alloy left untreated to develop a natural organic dark-brown sulfide patina from coastal saltwater exposure over successive decades.',
      project: 'Edifício Vento [PL-04]'
    }
  };

  const materialButtons = document.querySelectorAll('[data-material-target]');
  const matTitle = document.getElementById('mat-title');
  const matOrigin = document.getElementById('mat-origin');
  const matComp = document.getElementById('mat-comp');
  const matAbs = document.getElementById('mat-abs');
  const matCarbon = document.getElementById('mat-carbon');
  const matDesc = document.getElementById('mat-desc');
  const matProject = document.getElementById('mat-project');

  materialButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-material-target');
      const data = materialData[target];
      if (!data) return;

      materialButtons.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      if (matTitle) matTitle.textContent = data.title;
      if (matOrigin) matOrigin.textContent = data.origin;
      if (matComp) matComp.textContent = data.compressive;
      if (matAbs) matAbs.textContent = data.absorption;
      if (matCarbon) matCarbon.textContent = data.embodiedCarbon;
      if (matDesc) matDesc.textContent = data.description;
      if (matProject) matProject.textContent = data.project;
    });
  });

  // ── 2. Architectural Blueprint Cutaway Slider ─────────
  const blueprintToggles = document.querySelectorAll('[data-blueprint-toggle]');
  blueprintToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const card = toggle.closest('.project-monograph');
      if (!card) return;
      const isSchematic = card.classList.toggle('show-blueprint');
      toggle.setAttribute('aria-pressed', isSchematic ? 'true' : 'false');
      const label = toggle.querySelector('.blueprint-toggle__label');
      if (label) {
        label.textContent = isSchematic ? 'View Built Photograph' : 'Inspect Structural Blueprint';
      }
    });
  });

  // ── 3. Smooth In-Page Section Anchor Handling ─────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
        targetEl.setAttribute('tabindex', '-1');
        targetEl.focus({ preventScroll: true });
      }
    });
  });

})();
