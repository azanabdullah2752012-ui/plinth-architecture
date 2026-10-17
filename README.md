# GRID // 01 — Tactile Desktop Macro Console

An ultra-minimalist desktop mechanical macro console machined from 6063 aerospace billet aluminum. Featuring custom mechanical switches, rotary knurled encoders, and a monochrome memory-in-pixel E-ink display.

## Aesthetic Direction
- **Minimalist Hardware / Industrial Design** (inspired by Teenage Engineering & Dieter Rams).
- **Stark High-Contrast Gallery Palette**: Studio white (`#f7f7f5`), deep charcoal typography (`#111215`), and signature safety orange (`#ff4800`).
- **Zero generic AI slop**: No purple/blue gradients, no floaty blur balls, no walls of fake marketing copy.

## Interactive Hardware Simulator
The hero section features a fully functional, tactile, virtual replica of the physical unit:
- **4 Rotary Encoders**: Drag vertically or mouse-wheel to rotate with dynamic angle feedback.
- **6 Mechanical Switches**: Tactile keypress depth physics with keyboard shortcuts (`1`–`6`, `Space`).
- **Interactive E-Ink Screen**:
  1. **Focus Mode**: Live 25-minute Pomodoro timer with Start/Reset controls.
  2. **Telemetry Mode**: Real-time animated CPU and RAM bar gauges.
  3. **Deck Mode**: Active app macro profiles.
  4. **Pixel Runner**: Playable mini obstacle jumper directly inside the display (`Space` to jump).
- **Physical Rocker Power Switch**: Working power cycle with LED indicator light.
- **Material Finishes**: Toggle between *Raw Billet Aluminum*, *Matte Obsidian*, and *Vintage Bone*.

## Local Setup
Serve the root directory using any local web server:
```bash
python3 -m http.server 4173
```
Then visit `http://localhost:4173/`.
