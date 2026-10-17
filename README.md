# KÖNIG & SÖHNE // Atelier d'Horlogerie — Caliber KS-042

An independent Glashütte mechanical horological atelier producing 24 bespoke chronometer allocations per calendar year.

Designed strictly under the **Anti-Slop Design Guidelines**:
- **Signature Artifact**: Real-time 3D WebGL (Three.js) watch studio featuring PBR metallic surface shaders, sapphire crystal optical refraction, real-time oscillating Glucydur balance wheel (4.0 Hz / 28,800 vph), 360° mouse drag orbit, and an interactive **EXPLODE HOROLOGY** mechanical disassembly view.
- **Winding Crown Physics**: Click **WIND CROWN (+14H)** to physically turn the fluted crown and charge the 72-hour power reserve indicator.
- **Atmosphere & Materials**: Warm obsidian (`#0a0b0e`), untreated German silver (`#181b24`), 18K 4N rose gold, and heat-blued steel hands.
- **Strict Execution Laws**: Visible by default, parallel baseline alignment, accessible WCAG AA contrast, and 100% functional interactive controls.

---

## Interactive Features

1. **3D WebGL Watch Studio (`js/watch-3d.js`)**:
   - PBR metallic surface rendering with specular reflections on beveled lugs and step bezel.
   - Click & drag directly on the watch to orbit 360° around the case in 3D space.
   - Click **EXPLODE HOROLOGY** to smoothly slide apart the sapphire crystal, step bezel ring, moving hands, dial plate, movement caliber, and exhibition caseback along the Z-axis.
   - Live metallurgy switcher: **18K Rose Gold**, **Grade 5 Titanium**, **Obsidian DLC**, and **904L Steel**.
   - Real-time Glucydur balance wheel oscillating at 4.0 Hz in the open-heart 6 o'clock position.
2. **Movement Architecture & Technical Tolerances**:
   - Deep technical breakdowns of the Free-Sprung Glucydur balance, Breguet overcoil hairspring, screwed gold chatons, and twin-series mainspring barrels.
   - Complete Glashütte observatory laboratory tolerances table sharing parallel baselines.
3. **Bespoke Allocation Configurator (`js/app.js`)**:
   - Interactive commission builder with case metal, complication (Three-Hand, True Beat Dead-Seconds, Monopusher Chronograph), and strap leather.
   - Live lead time and pricing calculations (€38,500 – €58,000 EUR).
   - Submitting reserves an official Glashütte archive serial number (e.g. `KS-042-849`).

---

## Quickstart

Run a local server:
```bash
python3 -m http.server 4173
```
Open [http://localhost:4173](http://localhost:4173) in your browser.
