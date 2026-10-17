/**
 * CIPHER: PROTOCOL // Level Blueprints & Endless Mission Generator
 * Tactical stealth puzzles with predictable deterministic enemy patterns
 */

const LEVELS = [
  // ----------------------------------------------------
  // MISSION 01: ORIENTATION (Introduction to movement & exit)
  // ----------------------------------------------------
  {
    id: 1,
    name: '01 // PROVING GROUNDS',
    subtitle: 'Learn movement and basic extraction',
    width: 8,
    height: 6,
    player: { x: 1, y: 3 },
    exit: { x: 6, y: 3 },
    terminals: [
      { x: 4, y: 3, id: 't1', hacked: false, label: 'SECURITY HUB' }
    ],
    doors: [
      { x: 5, y: 3, locked: true, requiredTerminal: 't1' }
    ],
    walls: [
      { x: 3, y: 1 }, { x: 3, y: 2 },
      { x: 3, y: 4 }, { x: 3, y: 5 },
      { x: 5, y: 1 }, { x: 5, y: 2 },
      { x: 5, y: 4 }, { x: 5, y: 5 }
    ],
    guards: [],
    cameras: [],
    lasers: [],
    items: { emp: 1, smoke: 1, decoy: 0 }
  },

  // ----------------------------------------------------
  // MISSION 02: PATROL ROUTE (Guards & Vision Cones)
  // ----------------------------------------------------
  {
    id: 2,
    name: '02 // PERIMETER PATROL',
    subtitle: 'Evade guard vision cones and time your movement',
    width: 9,
    height: 7,
    player: { x: 1, y: 1 },
    exit: { x: 7, y: 5 },
    terminals: [
      { x: 7, y: 1, id: 't1', hacked: false, label: 'GATE CIPHER' }
    ],
    doors: [
      { x: 7, y: 4, locked: true, requiredTerminal: 't1' }
    ],
    walls: [
      { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 4 }, { x: 4, y: 5 },
      { x: 2, y: 3 }, { x: 6, y: 3 }
    ],
    guards: [
      {
        id: 'g1',
        x: 4,
        y: 3,
        facing: 'down',
        path: [
          { x: 4, y: 3, facing: 'down' },
          { x: 4, y: 4, facing: 'down' },
          { x: 4, y: 5, facing: 'up' },
          { x: 4, y: 4, facing: 'up' }
        ],
        pathIndex: 0
      }
    ],
    cameras: [],
    lasers: [],
    items: { emp: 1, smoke: 1, decoy: 1 }
  },

  // ----------------------------------------------------
  // MISSION 03: SURVEILLANCE SWEEP (Rotating Cameras)
  // ----------------------------------------------------
  {
    id: 3,
    name: '03 // CAMERA SWEEP',
    subtitle: 'Security cameras rotate 90 degrees every turn',
    width: 9,
    height: 7,
    player: { x: 1, y: 5 },
    exit: { x: 7, y: 1 },
    terminals: [
      { x: 4, y: 3, id: 't1', hacked: false, label: 'OVERRIDE' }
    ],
    doors: [
      { x: 6, y: 1, locked: true, requiredTerminal: 't1' }
    ],
    walls: [
      { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 },
      { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }
    ],
    guards: [],
    cameras: [
      {
        id: 'c1',
        x: 4,
        y: 1,
        facing: 'down',
        angles: ['down', 'right', 'down', 'left'],
        angleIndex: 0
      }
    ],
    lasers: [
      { x: 4, y: 5, active: true, cycle: 2, timer: 0 }
    ],
    items: { emp: 2, smoke: 1, decoy: 0 }
  },

  // ----------------------------------------------------
  // MISSION 04: INFRARED GAUNTLET (Laser Timing)
  // ----------------------------------------------------
  {
    id: 4,
    name: '04 // INFRARED CORRIDOR',
    subtitle: 'Lasers cycle active and inactive states on turns',
    width: 10,
    height: 7,
    player: { x: 1, y: 3 },
    exit: { x: 8, y: 3 },
    terminals: [
      { x: 5, y: 1, id: 't1', hacked: false, label: 'TERMINAL ALPHA' },
      { x: 5, y: 5, id: 't2', hacked: false, label: 'TERMINAL BETA' }
    ],
    doors: [
      { x: 7, y: 3, locked: true, requiredTerminal: 't1' }
    ],
    walls: [
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 4 }, { x: 3, y: 5 },
      { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 4 }, { x: 7, y: 5 }
    ],
    guards: [
      {
        id: 'g1',
        x: 5,
        y: 3,
        facing: 'right',
        path: [
          { x: 5, y: 3, facing: 'up' },
          { x: 5, y: 2, facing: 'down' },
          { x: 5, y: 3, facing: 'down' },
          { x: 5, y: 4, facing: 'up' }
        ],
        pathIndex: 0
      }
    ],
    cameras: [],
    lasers: [
      { x: 3, y: 3, active: true, cycle: 2, timer: 0 },
      { x: 5, y: 2, active: false, cycle: 2, timer: 1 },
      { x: 5, y: 4, active: false, cycle: 2, timer: 1 }
    ],
    items: { emp: 1, smoke: 2, decoy: 1 }
  },

  // ----------------------------------------------------
  // MISSION 05: DUAL OPERATIVE COMPLEX (Multi-Guard)
  // ----------------------------------------------------
  {
    id: 5,
    name: '05 // THE INNER SANCTUM',
    subtitle: 'Coordinated patrol paths and crossfire vision cones',
    width: 11,
    height: 8,
    player: { x: 1, y: 1 },
    exit: { x: 9, y: 6 },
    terminals: [
      { x: 9, y: 1, id: 't1', hacked: false, label: 'VAULT KEY' },
      { x: 1, y: 6, id: 't2', hacked: false, label: 'LASER KILL' }
    ],
    doors: [
      { x: 8, y: 6, locked: true, requiredTerminal: 't1' }
    ],
    walls: [
      { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 },
      { x: 5, y: 4 }, { x: 5, y: 5 },
      { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }
    ],
    guards: [
      {
        id: 'g1',
        x: 3,
        y: 4,
        facing: 'down',
        path: [
          { x: 3, y: 4, facing: 'right' },
          { x: 4, y: 4, facing: 'down' },
          { x: 4, y: 5, facing: 'left' },
          { x: 3, y: 5, facing: 'up' }
        ],
        pathIndex: 0
      },
      {
        id: 'g2',
        x: 7,
        y: 2,
        facing: 'right',
        path: [
          { x: 7, y: 2, facing: 'right' },
          { x: 8, y: 2, facing: 'left' }
        ],
        pathIndex: 0
      }
    ],
    cameras: [
      {
        id: 'c1',
        x: 1,
        y: 4,
        facing: 'right',
        angles: ['right', 'down', 'right', 'down'],
        angleIndex: 0
      }
    ],
    lasers: [
      { x: 9, y: 4, active: true, cycle: 3, timer: 0 }
    ],
    items: { emp: 2, smoke: 2, decoy: 2 }
  },

  // ----------------------------------------------------
  // MISSION 06: MASTER INFILTRATION (The Ultimate Vault)
  // ----------------------------------------------------
  {
    id: 6,
    name: '06 // MASTER PROTOCOL',
    subtitle: 'Full security array: cameras, lasers, guards, and vault cipher',
    width: 12,
    height: 9,
    player: { x: 1, y: 4 },
    exit: { x: 10, y: 4 },
    terminals: [
      { x: 6, y: 1, id: 't1', hacked: false, label: 'CIPHER 1' },
      { x: 6, y: 7, id: 't2', hacked: false, label: 'CIPHER 2' }
    ],
    doors: [
      { x: 9, y: 4, locked: true, requiredTerminal: 't1' },
      { x: 8, y: 4, locked: true, requiredTerminal: 't2' }
    ],
    walls: [
      { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 5 }, { x: 3, y: 6 },
      { x: 6, y: 3 }, { x: 6, y: 5 },
      { x: 9, y: 2 }, { x: 9, y: 3 }, { x: 9, y: 5 }, { x: 9, y: 6 }
    ],
    guards: [
      {
        id: 'g1',
        x: 4,
        y: 2,
        facing: 'down',
        path: [
          { x: 4, y: 2, facing: 'down' },
          { x: 4, y: 6, facing: 'up' }
        ],
        pathIndex: 0
      },
      {
        id: 'g2',
        x: 8,
        y: 6,
        facing: 'up',
        path: [
          { x: 8, y: 6, facing: 'up' },
          { x: 8, y: 2, facing: 'down' }
        ],
        pathIndex: 0
      }
    ],
    cameras: [
      {
        id: 'c1',
        x: 6,
        y: 4,
        facing: 'left',
        angles: ['left', 'up', 'right', 'down'],
        angleIndex: 0
      }
    ],
    lasers: [
      { x: 3, y: 4, active: true, cycle: 2, timer: 0 },
      { x: 6, y: 2, active: true, cycle: 2, timer: 1 },
      { x: 6, y: 6, active: true, cycle: 2, timer: 1 }
    ],
    items: { emp: 2, smoke: 2, decoy: 2 }
  }
];

/**
 * Procedural Mission Generator
 */
function generateProceduralLevel(seed = Date.now()) {
  const width = 10;
  const height = 8;
  const player = { x: 1, y: Math.floor(height / 2) };
  const exit = { x: width - 2, y: Math.floor(height / 2) };
  const termX = Math.floor(width / 2);
  const termY = Math.random() > 0.5 ? 2 : height - 3;

  const terminals = [{ x: termX, y: termY, id: 't_proc', hacked: false, label: 'CORE CIPHER' }];
  const doors = [{ x: exit.x - 1, y: exit.y, locked: true, requiredTerminal: 't_proc' }];

  const walls = [];
  for (let y = 1; y < height - 1; y++) {
    if (y !== Math.floor(height / 2) && y !== termY) {
      walls.push({ x: termX, y: y });
    }
  }

  const guards = [
    {
      id: 'g_proc_1',
      x: termX - 1,
      y: 3,
      facing: 'down',
      path: [
        { x: termX - 1, y: 2, facing: 'down' },
        { x: termX - 1, y: height - 3, facing: 'up' }
      ],
      pathIndex: 0
    }
  ];

  const cameras = [
    {
      id: 'c_proc_1',
      x: width - 3,
      y: 1,
      facing: 'down',
      angles: ['down', 'left', 'down', 'left'],
      angleIndex: 0
    }
  ];

  return {
    id: 99,
    name: 'PROCEDURAL // COVERT INFILTRATION',
    subtitle: 'Generated procedural security vault layout',
    width,
    height,
    player,
    exit,
    terminals,
    doors,
    walls,
    guards,
    cameras,
    lasers: [{ x: exit.x - 2, y: exit.y, active: true, cycle: 2, timer: 0 }],
    items: { emp: 2, smoke: 2, decoy: 1 }
  };
}

window.LEVELS = LEVELS;
window.generateProceduralLevel = generateProceduralLevel;
