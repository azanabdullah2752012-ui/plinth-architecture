# CIPHER: PROTOCOL // Tactical Stealth Infiltration

A minimalist turn-based stealth puzzle game running in your browser. Zero sound, zero video — pure strategic movement, line-of-sight evasion, security hacking, and tactical gadget deployment.

Designed under the **Anti-Slop Design Guidelines**: high-contrast tactical security grid, raycast vision cones, smooth movement interpolation, and infinite turn rewind (`Z`).

---

## How to Play (Instant 10-Second Guide)

1. **Move Your Agent**: Use `W A S D`, `Arrow Keys`, or simply **click an adjacent floor tile**.
2. **Dodge Red Vision Cones**: Patrol guards and security cameras project red vision cones across the floor. If you end your turn inside one, the alarm triggers!
3. **Hack Encrypted Terminals (`⚡`)**: Step on the yellow cipher terminal to hack it and unlock security blast doors.
4. **Reach Extraction (`EXIT`)**: Step on the green exit zone once all terminals are hacked to win the mission!
5. **Made a Mistake? Press `Z`**: Infinite turn rewind! You can undo any move at any time with zero penalty.

---

## Tactical Gadgets

- `[1] EMP Blast`: Deactivates all security cameras and lasers for 3 turns.
- `[2] Smoke Screen`: Deploys a 3x3 smoke cloud around your agent that completely blocks guard vision for 4 turns.
- `[3] Holo Decoy`: Place a holographic decoy on any tile to distract the nearest patrol guard.
- `[Space] Wait`: Stay in place for one turn to let guards walk past.

---

## Missions

- `01 // Proving Grounds`: Learn basic movement, doors, and extraction.
- `02 // Perimeter Patrol`: Evade moving patrol guards with vision cones.
- `03 // Camera Sweep`: Rotating 90° security cameras.
- `04 // Infrared Corridor`: Time your passage through cycling infrared lasers.
- `05 // The Inner Sanctum`: Multi-guard patrol crossfire.
- `06 // Master Protocol`: Full security array (lasers, cameras, guards, dual ciphers).
- `∞ // Procedural Heist`: Endless procedurally generated vault layouts!

---

## Quickstart

Run a local server:
```bash
python3 -m http.server 4173
```
Open [http://localhost:4173](http://localhost:4173) in your browser.
