# MONOLITH // Architectural Acoustic Sculptures

A brutalist luxury industrial design brand and landing page showcasing precision CNC unibody acoustic instruments sculpted from 120kg ingots of aerospace-grade 6061-T6 aluminum.

Designed strictly under the **Anti-Slop Design Guidelines**:
- **Signature Artifact**: Real-time 3D WebGL (Three.js) studio with PBR metallic reflections, interactive 360° mouse drag orbit, dynamic multi-point studio spotlights, and an interactive **EXPLODED ARCHITECTURE** disassembly view.
- **Acoustic Wavefront Simulator**: Real-time 2D wave equation canvas solver simulating isobaric sound wavefronts radiating from dual transducers into acoustic room boundaries.
- **Atmosphere & Materials**: Architectural obsidian (`#08090b`), raw billet aluminum, champagne titanium PVD, and tungsten plinths.
- **Strict Execution Laws**: Visible by default, parallel baseline alignment, accessible WCAG AA contrast, and 100% functional interactive controls.

---

## Interactive Features

1. **3D WebGL Studio Engine (`js/scene-3d.js`)**:
   - PBR metallic surface rendering with specular highlights.
   - Click & drag to rotate the monolithic instrument 360° in 3D space.
   - Click **EXPLODE ARCHITECTURE** to smoothly slide apart the rear acoustic shell, copper heat core, dual drivers, and front baffle along the Z-axis.
   - Instant finish switcher: **Raw Billet Silver**, **Stealth Obsidian**, and **Champagne Titanium**.
2. **Real-Time Acoustic Dispersion Field (`js/acoustic-sim.js`)**:
   - 2D finite-difference wave equation solver.
   - Interactive frequency slider (30 Hz to 240 Hz).
   - Room reflection boundary presets: Diffusive Studio, Treated Anechoic, and Concrete Hall.
3. **Internal Architecture & Engineering Tolerances**:
   - Deep metallurgical and acoustic breakdowns of the Beryllium vapor dome, Helmholtz copper core, isobaric compound woofer, and tungsten plinth.
   - Complete bench tolerances table sharing parallel baselines.
4. **Bespoke Allocation Configurator (`js/app.js`)**:
   - Interactive pair allocation builder with finish, transducer, and plinth selection.
   - Live mass and price calculations ($14,500 – $20,500 USD).
   - Submitting reserves an official Swiss municipal allocation serial number (e.g. `MN-842-1049`).

---

## Quickstart

Run a local server:
```bash
python3 -m http.server 4173
```
Open [http://localhost:4173](http://localhost:4173) in your browser.
