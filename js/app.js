/**
 * CIPHER: PROTOCOL // Main Coordinator & Input Controller
 * Controls: WASD / Arrows, Space to Wait, Z to Undo, Click-to-Move, Tactical Items
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const engine = new GameEngine();
  const renderer = new TacticalRenderer(canvas, engine);

  let decoyTargetingMode = false;

  // --- UI Elements ---
  const levelSelect = document.getElementById('level-select');
  const missionTitle = document.getElementById('mission-title');
  const missionSubtitle = document.getElementById('mission-subtitle');
  const turnCounter = document.getElementById('turn-counter');
  const terminalStatus = document.getElementById('terminal-status');
  const stealthStatus = document.getElementById('stealth-status');

  const btnEmp = document.getElementById('btn-item-emp');
  const btnSmoke = document.getElementById('btn-item-smoke');
  const btnDecoy = document.getElementById('btn-item-decoy');

  const empCount = document.getElementById('emp-count');
  const smokeCount = document.getElementById('smoke-count');
  const decoyCount = document.getElementById('decoy-count');

  const modalGameOver = document.getElementById('modal-game-over');
  const modalVictory = document.getElementById('modal-victory');
  const gameOverCause = document.getElementById('game-over-cause');
  const victoryTurns = document.getElementById('victory-turns');

  // --- Initialize Level Select ---
  function populateLevelSelect() {
    levelSelect.innerHTML = '';
    window.LEVELS.forEach((lvl, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = lvl.name;
      levelSelect.appendChild(opt);
    });

    const procOpt = document.createElement('option');
    procOpt.value = 'proc';
    procOpt.textContent = '∞ // PROCEDURAL HEIST';
    levelSelect.appendChild(procOpt);
  }

  populateLevelSelect();

  function loadSelectedLevel() {
    const val = levelSelect.value;
    if (val === 'proc') {
      const procLvl = window.generateProceduralLevel();
      engine.loadLevel(0, procLvl);
    } else {
      engine.loadLevel(parseInt(val, 10));
    }
    renderer.recalculateLayout();
    modalGameOver.classList.add('is-hidden');
    modalVictory.classList.add('is-hidden');
    decoyTargetingMode = false;
  }

  levelSelect.addEventListener('change', loadSelectedLevel);

  // --- Update HUD on State Change ---
  engine.subscribe((state, status) => {
    missionTitle.textContent = engine.levelData.name;
    missionSubtitle.textContent = engine.levelData.subtitle;
    turnCounter.textContent = `TURN ${engine.turnCount.toString().padStart(2, '0')}`;

    const totalTerms = state.terminals.length;
    const hackedCount = state.terminals.filter(t => t.hacked).length;
    terminalStatus.textContent = totalTerms > 0 ? `${hackedCount} / ${totalTerms} HACKED` : 'NO CIPHERS';
    terminalStatus.className = `status-chip ${hackedCount === totalTerms ? 'is-complete' : ''}`;

    // Item counts
    empCount.textContent = `[${state.items.emp}]`;
    smokeCount.textContent = `[${state.items.smoke}]`;
    decoyCount.textContent = `[${state.items.decoy}]`;

    btnEmp.disabled = state.items.emp <= 0;
    btnSmoke.disabled = state.items.smoke <= 0;
    btnDecoy.disabled = state.items.decoy <= 0;

    // Status chip
    if (status === 'DETECTED') {
      stealthStatus.textContent = 'ALARM // DETECTED';
      stealthStatus.className = 'status-chip is-alarm';
      gameOverCause.textContent = engine.detectionCause || 'SURVEILLANCE TRIGGERED';
      modalGameOver.classList.remove('is-hidden');
    } else if (status === 'VICTORY') {
      stealthStatus.textContent = 'STATUS // EXTRACTED';
      stealthStatus.className = 'status-chip is-victory';
      victoryTurns.textContent = `COMPLETED IN ${engine.turnCount} TURNS`;
      modalVictory.classList.remove('is-hidden');
    } else {
      stealthStatus.textContent = state.empTurnsLeft > 0 ? `EMP ACTIVE (${state.empTurnsLeft})` : 'STATUS // GHOST';
      stealthStatus.className = `status-chip ${state.empTurnsLeft > 0 ? 'is-emp' : 'is-ghost'}`;
      modalGameOver.classList.add('is-hidden');
      modalVictory.classList.add('is-hidden');
    }
  });

  // --- Keyboard Input Handling ---
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    if (e.code === 'KeyW' || e.code === 'ArrowUp') {
      e.preventDefault();
      engine.movePlayer(0, -1);
    } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
      e.preventDefault();
      engine.movePlayer(0, 1);
    } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
      e.preventDefault();
      engine.movePlayer(-1, 0);
    } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
      e.preventDefault();
      engine.movePlayer(1, 0);
    } else if (e.code === 'Space') {
      e.preventDefault();
      engine.waitTurn();
    } else if (e.code === 'KeyZ') {
      e.preventDefault();
      engine.undo();
    } else if (e.code === 'KeyR') {
      e.preventDefault();
      engine.restart();
    } else if (e.code === 'Digit1') {
      e.preventDefault();
      engine.useEmp();
    } else if (e.code === 'Digit2') {
      e.preventDefault();
      engine.useSmoke();
    } else if (e.code === 'Digit3') {
      e.preventDefault();
      toggleDecoyMode();
    } else if (e.code === 'Escape') {
      decoyTargetingMode = false;
      document.body.classList.remove('is-targeting');
    }
  });

  // --- Click / Touch Movement & Decoy Targeting ---
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const target = renderer.screenToGrid(sx, sy);

    if (decoyTargetingMode) {
      engine.useDecoy(target.x, target.y);
      decoyTargetingMode = false;
      document.body.classList.remove('is-targeting');
      return;
    }

    const px = engine.state.player.x;
    const py = engine.state.player.y;
    const dx = target.x - px;
    const dy = target.y - py;

    // Direct adjacent step
    if (Math.abs(dx) + Math.abs(dy) === 1) {
      engine.movePlayer(dx, dy);
    } else if (dx === 0 && dy === 0) {
      engine.waitTurn();
    }
  });

  // --- Tactical Item Buttons ---
  btnEmp.addEventListener('click', () => engine.useEmp());
  btnSmoke.addEventListener('click', () => engine.useSmoke());

  function toggleDecoyMode() {
    if (engine.state.items.decoy <= 0) return;
    decoyTargetingMode = !decoyTargetingMode;
    document.body.classList.toggle('is-targeting', decoyTargetingMode);
  }

  btnDecoy.addEventListener('click', toggleDecoyMode);

  // --- Bottom Action Buttons ---
  document.getElementById('btn-action-undo')?.addEventListener('click', () => engine.undo());
  document.getElementById('btn-action-wait')?.addEventListener('click', () => engine.waitTurn());
  document.getElementById('btn-action-restart')?.addEventListener('click', () => engine.restart());

  // Modal Buttons
  document.getElementById('btn-rewind-death')?.addEventListener('click', () => {
    engine.undo();
  });

  document.getElementById('btn-restart-death')?.addEventListener('click', () => {
    engine.restart();
  });

  document.getElementById('btn-next-level')?.addEventListener('click', () => {
    let nextIdx = engine.currentLevelIndex + 1;
    if (nextIdx >= window.LEVELS.length) {
      levelSelect.value = 'proc';
    } else {
      levelSelect.value = nextIdx;
    }
    loadSelectedLevel();
  });

  // Start with Level 1
  loadSelectedLevel();
});
