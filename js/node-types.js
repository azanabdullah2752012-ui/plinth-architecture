/**
 * KNOT // Node Type Registry & Computation Engine
 * Pure reactive visual programming library
 */

const NODE_CATEGORIES = {
  INPUT: 'Sources & Inputs',
  MATH: 'Math & Operators',
  LOGIC: 'Logic & Circuits',
  DATA: 'Text & Transformers',
  OUTPUT: 'Displays & Sinks'
};

const NODE_DEFINITIONS = {
  // ==========================================
  // INPUT NODES
  // ==========================================
  number_slider: {
    type: 'number_slider',
    title: 'Number Slider',
    category: NODE_CATEGORIES.INPUT,
    accent: '#e59344',
    inputs: [],
    outputs: [{ id: 'val', label: 'Value', type: 'number' }],
    defaultState: { min: 0, max: 100, step: 1, value: 42, label: 'Quantity' },
    renderUI(node, state, updateFn) {
      const container = document.createElement('div');
      container.className = 'node-control-stack';

      const labelInput = document.createElement('input');
      labelInput.type = 'text';
      labelInput.className = 'node-inline-input node-label-input';
      labelInput.value = state.label || 'Value';
      labelInput.placeholder = 'Label...';
      labelInput.oninput = (e) => updateFn({ label: e.target.value });

      const valRow = document.createElement('div');
      valRow.className = 'node-val-row';

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.className = 'node-slider';
      slider.min = state.min;
      slider.max = state.max;
      slider.step = state.step;
      slider.value = state.value;

      const numInput = document.createElement('input');
      numInput.type = 'number';
      numInput.className = 'node-inline-input node-num-input';
      numInput.value = state.value;
      numInput.step = state.step;

      slider.oninput = (e) => {
        const v = parseFloat(e.target.value);
        numInput.value = v;
        updateFn({ value: v });
      };

      numInput.oninput = (e) => {
        const v = parseFloat(e.target.value) || 0;
        slider.value = v;
        updateFn({ value: v });
      };

      valRow.appendChild(slider);
      valRow.appendChild(numInput);
      container.appendChild(labelInput);
      container.appendChild(valRow);
      return container;
    },
    evaluate(inputs, state) {
      return { val: Number(state.value) || 0 };
    }
  },

  toggle_switch: {
    type: 'toggle_switch',
    title: 'Toggle Switch',
    category: NODE_CATEGORIES.INPUT,
    accent: '#e59344',
    inputs: [],
    outputs: [{ id: 'state', label: 'State', type: 'boolean' }],
    defaultState: { value: false, label: 'Active Flag' },
    renderUI(node, state, updateFn) {
      const container = document.createElement('div');
      container.className = 'node-control-stack';

      const labelInput = document.createElement('input');
      labelInput.type = 'text';
      labelInput.className = 'node-inline-input node-label-input';
      labelInput.value = state.label || 'Flag';
      labelInput.oninput = (e) => updateFn({ label: e.target.value });

      const toggleRow = document.createElement('div');
      toggleRow.className = 'node-toggle-row';

      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = `node-tactile-toggle ${state.value ? 'is-on' : 'is-off'}`;
      toggleBtn.textContent = state.value ? 'HIGH (1)' : 'LOW (0)';
      toggleBtn.onclick = () => {
        const next = !state.value;
        toggleBtn.className = `node-tactile-toggle ${next ? 'is-on' : 'is-off'}`;
        toggleBtn.textContent = next ? 'HIGH (1)' : 'LOW (0)';
        updateFn({ value: next });
      };

      toggleRow.appendChild(toggleBtn);
      container.appendChild(labelInput);
      container.appendChild(toggleRow);
      return container;
    },
    evaluate(inputs, state) {
      return { state: Boolean(state.value) };
    }
  },

  text_input: {
    type: 'text_input',
    title: 'Text String',
    category: NODE_CATEGORIES.INPUT,
    accent: '#e59344',
    inputs: [],
    outputs: [{ id: 'text', label: 'Text', type: 'string' }],
    defaultState: { value: 'Synthesizing data' },
    renderUI(node, state, updateFn) {
      const container = document.createElement('div');
      container.className = 'node-control-stack';
      const input = document.createElement('textarea');
      input.className = 'node-textarea';
      input.rows = 2;
      input.value = state.value;
      input.placeholder = 'Enter string...';
      input.oninput = (e) => updateFn({ value: e.target.value });
      container.appendChild(input);
      return container;
    },
    evaluate(inputs, state) {
      return { text: String(state.value || '') };
    }
  },

  clock_pulse: {
    type: 'clock_pulse',
    title: 'Clock Pulse',
    category: NODE_CATEGORIES.INPUT,
    accent: '#39ff8a',
    inputs: [],
    outputs: [
      { id: 'tick', label: 'Tick (ms)', type: 'number' },
      { id: 'count', label: 'Step Count', type: 'number' }
    ],
    defaultState: { bpm: 60, intervalMs: 500, count: 0, isRunning: true },
    renderUI(node, state, updateFn) {
      const container = document.createElement('div');
      container.className = 'node-control-stack';

      const row = document.createElement('div');
      row.className = 'node-clock-row';

      const rateLabel = document.createElement('span');
      rateLabel.className = 'node-micro-label';
      rateLabel.textContent = `INTERVAL: ${state.intervalMs}ms`;

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.className = 'node-slider';
      slider.min = 50;
      slider.max = 2000;
      slider.step = 50;
      slider.value = state.intervalMs;
      slider.oninput = (e) => {
        const v = parseInt(e.target.value, 10);
        rateLabel.textContent = `INTERVAL: ${v}ms`;
        updateFn({ intervalMs: v });
      };

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `node-micro-btn ${state.isRunning ? 'is-active' : ''}`;
      btn.textContent = state.isRunning ? 'PAUSE' : 'RUN';
      btn.onclick = () => {
        const next = !state.isRunning;
        btn.textContent = next ? 'PAUSE' : 'RUN';
        btn.classList.toggle('is-active', next);
        updateFn({ isRunning: next });
      };

      row.appendChild(slider);
      row.appendChild(btn);
      container.appendChild(rateLabel);
      container.appendChild(row);
      return container;
    },
    evaluate(inputs, state) {
      return { tick: performance.now(), count: state.count || 0 };
    }
  },

  json_source: {
    type: 'json_source',
    title: 'JSON Payload',
    category: NODE_CATEGORIES.INPUT,
    accent: '#4facfe',
    inputs: [],
    outputs: [{ id: 'data', label: 'Object', type: 'object' }],
    defaultState: {
      jsonString: JSON.stringify({
        id: "TX-904",
        status: "verified",
        user: { name: "Elena Ramos", tier: "pro" },
        metrics: { latency: 14.2, load: 0.38 }
      }, null, 2)
    },
    renderUI(node, state, updateFn) {
      const container = document.createElement('div');
      container.className = 'node-control-stack';
      const ta = document.createElement('textarea');
      ta.className = 'node-code-editor';
      ta.rows = 5;
      ta.value = state.jsonString;
      ta.spellcheck = false;

      const status = document.createElement('div');
      status.className = 'node-status-text';
      status.textContent = 'JSON VALID';

      ta.oninput = (e) => {
        try {
          JSON.parse(e.target.value);
          status.textContent = 'JSON VALID';
          status.className = 'node-status-text is-valid';
          updateFn({ jsonString: e.target.value });
        } catch (err) {
          status.textContent = 'SYNTAX ERROR';
          status.className = 'node-status-text is-error';
        }
      };

      container.appendChild(ta);
      container.appendChild(status);
      return container;
    },
    evaluate(inputs, state) {
      try {
        return { data: JSON.parse(state.jsonString) };
      } catch (e) {
        return { data: {} };
      }
    }
  },

  // ==========================================
  // MATH & OPERATORS
  // ==========================================
  math_op: {
    type: 'math_op',
    title: 'Math Operator',
    category: NODE_CATEGORIES.MATH,
    accent: '#3fc1c9',
    inputs: [
      { id: 'a', label: 'A', type: 'number' },
      { id: 'b', label: 'B', type: 'number' }
    ],
    outputs: [{ id: 'result', label: 'Result', type: 'number' }],
    defaultState: { op: 'add' },
    renderUI(node, state, updateFn) {
      const select = document.createElement('select');
      select.className = 'node-select';
      const ops = [
        { id: 'add', label: 'Add (A + B)' },
        { id: 'sub', label: 'Subtract (A - B)' },
        { id: 'mul', label: 'Multiply (A × B)' },
        { id: 'div', label: 'Divide (A ÷ B)' },
        { id: 'mod', label: 'Modulo (A % B)' },
        { id: 'pow', label: 'Power (A ^ B)' }
      ];
      ops.forEach((o) => {
        const opt = document.createElement('option');
        opt.value = o.id;
        opt.textContent = o.label;
        if (o.id === state.op) opt.selected = true;
        select.appendChild(opt);
      });
      select.onchange = (e) => updateFn({ op: e.target.value });
      return select;
    },
    evaluate(inputs, state) {
      const a = Number(inputs.a !== undefined ? inputs.a : 0);
      const b = Number(inputs.b !== undefined ? inputs.b : 0);
      let res = 0;
      switch (state.op) {
        case 'add': res = a + b; break;
        case 'sub': res = a - b; break;
        case 'mul': res = a * b; break;
        case 'div': res = b !== 0 ? a / b : 0; break;
        case 'mod': res = b !== 0 ? a % b : 0; break;
        case 'pow': res = Math.pow(a, b); break;
      }
      return { result: Math.round(res * 1000) / 1000 };
    }
  },

  clamp_range: {
    type: 'clamp_range',
    title: 'Clamp Range',
    category: NODE_CATEGORIES.MATH,
    accent: '#3fc1c9',
    inputs: [
      { id: 'val', label: 'Value', type: 'number' },
      { id: 'min', label: 'Min', type: 'number' },
      { id: 'max', label: 'Max', type: 'number' }
    ],
    outputs: [{ id: 'result', label: 'Clamped', type: 'number' }],
    defaultState: { fallbackMin: 0, fallbackMax: 100 },
    renderUI(node, state, updateFn) {
      const div = document.createElement('div');
      div.className = 'node-hint';
      div.textContent = 'Bounds: [Min .. Max]';
      return div;
    },
    evaluate(inputs, state) {
      const v = Number(inputs.val !== undefined ? inputs.val : 0);
      const min = Number(inputs.min !== undefined ? inputs.min : state.fallbackMin);
      const max = Number(inputs.max !== undefined ? inputs.max : state.fallbackMax);
      return { result: Math.max(min, Math.min(max, v)) };
    }
  },

  comparator: {
    type: 'comparator',
    title: 'Comparator',
    category: NODE_CATEGORIES.MATH,
    accent: '#3fc1c9',
    inputs: [
      { id: 'a', label: 'A', type: 'any' },
      { id: 'b', label: 'B', type: 'any' }
    ],
    outputs: [{ id: 'result', label: 'Boolean', type: 'boolean' }],
    defaultState: { op: 'gt' },
    renderUI(node, state, updateFn) {
      const select = document.createElement('select');
      select.className = 'node-select';
      const ops = [
        { id: 'eq', label: 'A == B (Equal)' },
        { id: 'neq', label: 'A != B (Not Equal)' },
        { id: 'gt', label: 'A > B (Greater)' },
        { id: 'gte', label: 'A >= B (Greater/Equal)' },
        { id: 'lt', label: 'A < B (Less)' },
        { id: 'lte', label: 'A <= B (Less/Equal)' }
      ];
      ops.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.id;
        opt.textContent = o.label;
        if (o.id === state.op) opt.selected = true;
        select.appendChild(opt);
      });
      select.onchange = (e) => updateFn({ op: e.target.value });
      return select;
    },
    evaluate(inputs, state) {
      const a = inputs.a !== undefined ? inputs.a : 0;
      const b = inputs.b !== undefined ? inputs.b : 0;
      let res = false;
      switch (state.op) {
        case 'eq': res = a == b; break;
        case 'neq': res = a != b; break;
        case 'gt': res = a > b; break;
        case 'gte': res = a >= b; break;
        case 'lt': res = a < b; break;
        case 'lte': res = a <= b; break;
      }
      return { result: Boolean(res) };
    }
  },

  // ==========================================
  // LOGIC & CIRCUITS
  // ==========================================
  logic_gate: {
    type: 'logic_gate',
    title: 'Logic Gate',
    category: NODE_CATEGORIES.LOGIC,
    accent: '#d94b43',
    inputs: [
      { id: 'a', label: 'A', type: 'boolean' },
      { id: 'b', label: 'B', type: 'boolean' }
    ],
    outputs: [{ id: 'out', label: 'Output', type: 'boolean' }],
    defaultState: { gate: 'AND' },
    renderUI(node, state, updateFn) {
      const select = document.createElement('select');
      select.className = 'node-select';
      ['AND', 'OR', 'XOR', 'NAND', 'NOR', 'NOT (A)'].forEach(g => {
        const opt = document.createElement('option');
        opt.value = g;
        opt.textContent = g;
        if (g === state.gate) opt.selected = true;
        select.appendChild(opt);
      });
      select.onchange = (e) => updateFn({ gate: e.target.value });
      return select;
    },
    evaluate(inputs, state) {
      const a = Boolean(inputs.a);
      const b = Boolean(inputs.b);
      let out = false;
      switch (state.gate) {
        case 'AND': out = a && b; break;
        case 'OR': out = a || b; break;
        case 'XOR': out = a !== b; break;
        case 'NAND': out = !(a && b); break;
        case 'NOR': out = !(a || b); break;
        case 'NOT (A)': out = !a; break;
      }
      return { out };
    }
  },

  conditional_switch: {
    type: 'conditional_switch',
    title: 'Ternary Switch',
    category: NODE_CATEGORIES.LOGIC,
    accent: '#d94b43',
    inputs: [
      { id: 'condition', label: 'If (Bool)', type: 'boolean' },
      { id: 'trueVal', label: 'Then', type: 'any' },
      { id: 'falseVal', label: 'Else', type: 'any' }
    ],
    outputs: [{ id: 'out', label: 'Output', type: 'any' }],
    defaultState: {},
    renderUI() {
      const div = document.createElement('div');
      div.className = 'node-hint';
      div.textContent = 'If True → Then, else Else';
      return div;
    },
    evaluate(inputs) {
      const cond = Boolean(inputs.condition);
      return { out: cond ? inputs.trueVal : inputs.falseVal };
    }
  },

  // ==========================================
  // TEXT & DATA TRANSFORMERS
  // ==========================================
  template_string: {
    type: 'template_string',
    title: 'Template Formatter',
    category: NODE_CATEGORIES.DATA,
    accent: '#9b51e0',
    inputs: [
      { id: 'a', label: '{a}', type: 'any' },
      { id: 'b', label: '{b}', type: 'any' },
      { id: 'c', label: '{c}', type: 'any' }
    ],
    outputs: [{ id: 'result', label: 'String', type: 'string' }],
    defaultState: { template: 'Order #{a} | Subtotal: ${b} (Status: {c})' },
    renderUI(node, state, updateFn) {
      const container = document.createElement('div');
      container.className = 'node-control-stack';
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'node-inline-input';
      input.value = state.template;
      input.oninput = (e) => updateFn({ template: e.target.value });
      container.appendChild(input);
      return container;
    },
    evaluate(inputs, state) {
      let str = state.template || '';
      str = str.replace(/\{a\}/g, inputs.a !== undefined ? inputs.a : '');
      str = str.replace(/\{b\}/g, inputs.b !== undefined ? inputs.b : '');
      str = str.replace(/\{c\}/g, inputs.c !== undefined ? inputs.c : '');
      return { result: str };
    }
  },

  json_query: {
    type: 'json_query',
    title: 'JSON Path Extractor',
    category: NODE_CATEGORIES.DATA,
    accent: '#9b51e0',
    inputs: [{ id: 'data', label: 'Object', type: 'object' }],
    outputs: [{ id: 'val', label: 'Value', type: 'any' }],
    defaultState: { path: 'user.name' },
    renderUI(node, state, updateFn) {
      const container = document.createElement('div');
      container.className = 'node-control-stack';
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'node-inline-input';
      input.value = state.path;
      input.placeholder = 'e.g. user.name or items[0]';
      input.oninput = (e) => updateFn({ path: e.target.value });
      container.appendChild(input);
      return container;
    },
    evaluate(inputs, state) {
      const obj = inputs.data;
      if (!obj || typeof obj !== 'object') return { val: null };
      try {
        const parts = (state.path || '').split('.');
        let cur = obj;
        for (const p of parts) {
          if (cur === undefined || cur === null) break;
          cur = cur[p];
        }
        return { val: cur };
      } catch (e) {
        return { val: null };
      }
    }
  },

  // ==========================================
  // OUTPUTS & VISUALIZERS
  // ==========================================
  gauge_meter: {
    type: 'gauge_meter',
    title: 'Value Gauge',
    category: NODE_CATEGORIES.OUTPUT,
    accent: '#e59344',
    inputs: [{ id: 'val', label: 'Value', type: 'number' }],
    outputs: [],
    defaultState: { min: 0, max: 100, unit: '%' },
    renderUI(node, state, updateFn) {
      const container = document.createElement('div');
      container.className = 'node-gauge-container';

      const readout = document.createElement('div');
      readout.className = 'node-gauge-readout';
      readout.textContent = '0.00';

      const barBg = document.createElement('div');
      barBg.className = 'node-gauge-bar-bg';
      const barFill = document.createElement('div');
      barFill.className = 'node-gauge-bar-fill';
      barBg.appendChild(barFill);

      container.appendChild(readout);
      container.appendChild(barBg);

      node._updateDisplay = (inputs) => {
        const v = Number(inputs.val !== undefined ? inputs.val : 0);
        readout.textContent = `${v.toFixed(2)}${state.unit || ''}`;
        const pct = Math.max(0, Math.min(100, ((v - state.min) / (state.max - state.min)) * 100));
        barFill.style.width = `${pct}%`;
      };

      return container;
    },
    evaluate(inputs) {
      return {};
    }
  },

  sparkline_chart: {
    type: 'sparkline_chart',
    title: 'Live Sparkline',
    category: NODE_CATEGORIES.OUTPUT,
    accent: '#39ff8a',
    inputs: [{ id: 'val', label: 'Signal', type: 'number' }],
    outputs: [],
    defaultState: { historySize: 40 },
    renderUI(node, state) {
      const canvas = document.createElement('canvas');
      canvas.className = 'node-sparkline-canvas';
      canvas.width = 180;
      canvas.height = 48;
      const ctx = canvas.getContext('2d');
      const history = [];

      node._updateDisplay = (inputs) => {
        const v = Number(inputs.val !== undefined ? inputs.val : 0);
        history.push(v);
        if (history.length > state.historySize) history.shift();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (history.length < 2) return;

        const min = Math.min(...history);
        const max = Math.max(...history);
        const range = max - min || 1;

        ctx.beginPath();
        ctx.strokeStyle = '#39ff8a';
        ctx.lineWidth = 1.5;

        for (let i = 0; i < history.length; i++) {
          const x = (i / (history.length - 1)) * canvas.width;
          const y = canvas.height - ((history[i] - min) / range) * (canvas.height - 8) - 4;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      return canvas;
    },
    evaluate() {
      return {};
    }
  },

  card_display: {
    type: 'card_display',
    title: 'Output Telemetry',
    category: NODE_CATEGORIES.OUTPUT,
    accent: '#3fc1c9',
    inputs: [
      { id: 'title', label: 'Title', type: 'string' },
      { id: 'value', label: 'Value', type: 'any' },
      { id: 'status', label: 'Verified', type: 'boolean' }
    ],
    outputs: [],
    defaultState: {},
    renderUI(node) {
      const card = document.createElement('div');
      card.className = 'node-telemetry-card';

      const header = document.createElement('div');
      header.className = 'telemetry-header';
      const titleSpan = document.createElement('span');
      titleSpan.className = 'telemetry-title';
      titleSpan.textContent = 'TELEMETRY';
      const badge = document.createElement('span');
      badge.className = 'telemetry-badge';
      badge.textContent = 'STANDBY';

      header.appendChild(titleSpan);
      header.appendChild(badge);

      const valDisplay = document.createElement('div');
      valDisplay.className = 'telemetry-value';
      valDisplay.textContent = '—';

      card.appendChild(header);
      card.appendChild(valDisplay);

      node._updateDisplay = (inputs) => {
        titleSpan.textContent = inputs.title ? String(inputs.title).toUpperCase() : 'TELEMETRY';
        valDisplay.textContent = inputs.value !== undefined ? String(inputs.value) : '—';
        if (inputs.status !== undefined) {
          badge.textContent = inputs.status ? 'ONLINE' : 'OFFLINE';
          badge.className = `telemetry-badge ${inputs.status ? 'is-valid' : 'is-off'}`;
        }
      };

      return card;
    },
    evaluate() {
      return {};
    }
  },

  led_indicator: {
    type: 'led_indicator',
    title: 'Status LED',
    category: NODE_CATEGORIES.OUTPUT,
    accent: '#39ff8a',
    inputs: [{ id: 'signal', label: 'Signal', type: 'boolean' }],
    outputs: [],
    defaultState: { label: 'Signal Status' },
    renderUI(node, state, updateFn) {
      const container = document.createElement('div');
      container.className = 'node-led-wrap';

      const led = document.createElement('div');
      led.className = 'node-led-bulb';

      const label = document.createElement('span');
      label.className = 'node-led-label';
      label.textContent = state.label || 'SIGNAL';

      container.appendChild(led);
      container.appendChild(label);

      node._updateDisplay = (inputs) => {
        const on = Boolean(inputs.signal);
        led.className = `node-led-bulb ${on ? 'is-lit' : ''}`;
      };

      return container;
    },
    evaluate() {
      return {};
    }
  }
};

window.NODE_CATEGORIES = NODE_CATEGORIES;
window.NODE_DEFINITIONS = NODE_DEFINITIONS;
