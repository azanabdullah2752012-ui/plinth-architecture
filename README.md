# KNOT // Reactive Visual Dataflow & Node Canvas

A high-performance, infinite-canvas visual dataflow and reactive computing workbench running in the browser. Zero audio, zero video — pure logic, math, circuits, and visual programming.

Built strictly under the **Anti-Slop Design Guidelines**: deep carbon industrial console styling, cubic bezier patch cables with animated data pulses, live topological graph evaluation, and zero generic boilerplate.

---

## Key Features

### 1. Infinite Reactive Canvas
- **Fluid Navigation**: Pan via `Space + Drag`, Middle Mouse button, or dragging empty canvas; Zoom via mouse scroll wheel or trackpad pinch.
- **Dynamic Bezier Cables**: Smooth vector cubic bezier patch cables with glowing directional cores.
- **Animated Data Pulses**: Real-time energy particles travel along active cables whenever data recalculates downstream.
- **Minimap Radar**: Live picture-in-picture viewport overview showing all node clusters and camera position.

### 2. Comprehensive Node Operator Library
- **Sources & Inputs**:
  - `Number Slider`: Precision integer/float sliders with direct numeric inputs.
  - `Toggle Switch`: Tactile binary HIGH/LOW state toggle.
  - `Text String`: Multi-line text string supplier.
  - `Clock Pulse`: Interval tick & step counter generator with play/pause.
  - `JSON Payload`: Editable JSON source with real-time syntax verification.
- **Math & Operators**:
  - `Math Operator`: Add, Subtract, Multiply, Divide, Modulo, Exponentiation.
  - `Comparator`: Equality, Inequality, Greater/Less-than comparisons.
  - `Clamp Range`: Upper and lower boundary constraint.
- **Logic & Circuits**:
  - `Logic Gate`: AND, OR, XOR, NAND, NOR, NOT.
  - `Ternary Switch`: Conditional `If Condition Then Else` routing.
- **Text & Transformation**:
  - `Template Formatter`: Dynamic string interpolation (`{a}`, `{b}`, `{c}`).
  - `JSON Path Extractor`: Deep object property retrieval (e.g. `user.tier` or `metrics.latency`).
- **Displays & Sinks**:
  - `Value Gauge`: Live graduated bar meter and numeric readout.
  - `Live Sparkline`: Real-time scrolling strip-chart plotting dynamic signals.
  - `Output Telemetry Card`: Industrial telemetry card with verified status badge.
  - `Status LED`: Illuminated phosphor diode with state glow.

### 3. Factory Blueprints
1. **01 // Dynamic Pricing & VIP Invoice**: Interactive e-commerce pipeline with quantity, unit price, VIP tier discount logic, sales tax calculation, and real-time invoice display.
2. **02 // Digital Binary Half-Adder Circuit**: Hardware logic simulation calculating Sum (XOR) and Carry (AND) with illuminated LED status bulbs.
3. **03 // Live Clock Pulse & Sparkline Chart**: High-frequency clock signal with modulo math and dynamic strip-chart plotting.

### 4. Persistence & Export
- **Export to JSON**: Download the full node graph and wire connections as a portable `.json` file.
- **Import from JSON**: Load any saved pipeline with one click.
- **Quick Node Catalog**: Press `Shift+A`, click `+ ADD NODE`, or double-click anywhere on the canvas to open the instant fuzzy node search.

---

## Quickstart

Run a local server:
```bash
python3 -m http.server 4173
```
Open [http://localhost:4173](http://localhost:4173) in your browser.
Drag nodes, wire ports together, adjust sliders, and watch values compute live!
