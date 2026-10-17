/**
 * KNOT // Factory Blueprints & Pipelines
 * Interactive pre-built reactive graphs
 */

const FACTORY_BLUEPRINTS = {
  'pricing_pipeline': {
    name: '01 // Dynamic Pricing & VIP Invoice',
    description: 'Real-time e-commerce subtotal, VIP condition logic, tax computation, and live invoice card.',
    graph: {
      nodes: [
        {
          id: 'n_price',
          type: 'number_slider',
          x: 60,
          y: 60,
          state: { label: 'Unit Price ($)', min: 5, max: 200, step: 1, value: 48 }
        },
        {
          id: 'n_qty',
          type: 'number_slider',
          x: 60,
          y: 220,
          state: { label: 'Quantity', min: 1, max: 20, step: 1, value: 4 }
        },
        {
          id: 'n_mul',
          type: 'math_op',
          x: 360,
          y: 120,
          state: { op: 'mul' }
        },
        {
          id: 'n_vip',
          type: 'toggle_switch',
          x: 60,
          y: 380,
          state: { label: 'VIP 20% Discount', value: true }
        },
        {
          id: 'n_disc_mul',
          type: 'math_op',
          x: 360,
          y: 320,
          state: { op: 'mul' }
        },
        {
          id: 'n_rate',
          type: 'number_slider',
          x: 60,
          y: 520,
          state: { label: 'Discount Factor', min: 0.5, max: 1.0, step: 0.05, value: 0.8 }
        },
        {
          id: 'n_cond',
          type: 'conditional_switch',
          x: 620,
          y: 180,
          state: {}
        },
        {
          id: 'n_tax_rate',
          type: 'number_slider',
          x: 360,
          y: 500,
          state: { label: 'Sales Tax Rate (%)', min: 0, max: 20, step: 0.5, value: 8.5 }
        },
        {
          id: 'n_tax_calc',
          type: 'math_op',
          x: 880,
          y: 320,
          state: { op: 'mul' }
        },
        {
          id: 'n_tax_pct',
          type: 'math_op',
          x: 620,
          y: 480,
          state: { op: 'div' }
        },
        {
          id: 'n_hundred',
          type: 'number_slider',
          x: 360,
          y: 680,
          state: { label: 'Percent Divisor', min: 100, max: 100, step: 1, value: 100 }
        },
        {
          id: 'n_total',
          type: 'math_op',
          x: 1140,
          y: 180,
          state: { op: 'add' }
        },
        {
          id: 'n_gauge',
          type: 'gauge_meter',
          x: 1400,
          y: 80,
          state: { min: 0, max: 1000, unit: '$' }
        },
        {
          id: 'n_card',
          type: 'card_display',
          x: 1400,
          y: 260,
          state: {}
        }
      ],
      wires: [
        // Subtotal = Price * Qty
        { fromNode: 'n_price', fromPort: 'val', toNode: 'n_mul', toPort: 'a' },
        { fromNode: 'n_qty', fromPort: 'val', toNode: 'n_mul', toPort: 'b' },

        // Discounted Subtotal = Subtotal * Rate
        { fromNode: 'n_mul', fromPort: 'result', toNode: 'n_disc_mul', toPort: 'a' },
        { fromNode: 'n_rate', fromPort: 'val', toNode: 'n_disc_mul', toPort: 'b' },

        // If VIP -> Discounted, else Subtotal
        { fromNode: 'n_vip', fromPort: 'state', toNode: 'n_cond', toPort: 'condition' },
        { fromNode: 'n_disc_mul', fromPort: 'result', toNode: 'n_cond', toPort: 'trueVal' },
        { fromNode: 'n_mul', fromPort: 'result', toNode: 'n_cond', toPort: 'falseVal' },

        // Tax Pct = Tax Rate / 100
        { fromNode: 'n_tax_rate', fromPort: 'val', toNode: 'n_tax_pct', toPort: 'a' },
        { fromNode: 'n_hundred', fromPort: 'val', toNode: 'n_tax_pct', toPort: 'b' },

        // Tax Amount = Condition Output * Tax Pct
        { fromNode: 'n_cond', fromPort: 'out', toNode: 'n_tax_calc', toPort: 'a' },
        { fromNode: 'n_tax_pct', fromPort: 'result', toNode: 'n_tax_calc', toPort: 'b' },

        // Final Total = Post-discount + Tax Amount
        { fromNode: 'n_cond', fromPort: 'out', toNode: 'n_total', toPort: 'a' },
        { fromNode: 'n_tax_calc', fromPort: 'result', toNode: 'n_total', toPort: 'b' },

        // Gauge & Card Visualizers
        { fromNode: 'n_total', fromPort: 'result', toNode: 'n_gauge', toPort: 'val' },
        { fromNode: 'n_total', fromPort: 'result', toNode: 'n_card', toPort: 'value' },
        { fromNode: 'n_vip', fromPort: 'state', toNode: 'n_card', toPort: 'status' }
      ]
    }
  },

  'logic_adder': {
    name: '02 // Digital Binary Half-Adder Circuit',
    description: 'Hardware logic gate simulation calculating Sum (XOR) and Carry (AND) with illuminated LED diodes.',
    graph: {
      nodes: [
        {
          id: 'n_bit_a',
          type: 'toggle_switch',
          x: 100,
          y: 120,
          state: { label: 'Input Bit A', value: true }
        },
        {
          id: 'n_bit_b',
          type: 'toggle_switch',
          x: 100,
          y: 300,
          state: { label: 'Input Bit B', value: false }
        },
        {
          id: 'n_xor',
          type: 'logic_gate',
          x: 420,
          y: 120,
          state: { gate: 'XOR' }
        },
        {
          id: 'n_and',
          type: 'logic_gate',
          x: 420,
          y: 300,
          state: { gate: 'AND' }
        },
        {
          id: 'n_led_sum',
          type: 'led_indicator',
          x: 740,
          y: 120,
          state: { label: 'SUM BIT (Q0)' }
        },
        {
          id: 'n_led_carry',
          type: 'led_indicator',
          x: 740,
          y: 300,
          state: { label: 'CARRY BIT (Q1)' }
        },
        {
          id: 'n_card_res',
          type: 'card_display',
          x: 1020,
          y: 200,
          state: {}
        }
      ],
      wires: [
        { fromNode: 'n_bit_a', fromPort: 'state', toNode: 'n_xor', toPort: 'a' },
        { fromNode: 'n_bit_b', fromPort: 'state', toNode: 'n_xor', toPort: 'b' },
        { fromNode: 'n_bit_a', fromPort: 'state', toNode: 'n_and', toPort: 'a' },
        { fromNode: 'n_bit_b', fromPort: 'state', toNode: 'n_and', toPort: 'b' },
        { fromNode: 'n_xor', fromPort: 'out', toNode: 'n_led_sum', toPort: 'signal' },
        { fromNode: 'n_and', fromPort: 'out', toNode: 'n_led_carry', toPort: 'signal' },
        { fromNode: 'n_xor', fromPort: 'out', toNode: 'n_card_res', toPort: 'status' }
      ]
    }
  },

  'sparkline_oscillator': {
    name: '03 // Live Clock Pulse & Sparkline Chart',
    description: 'High-frequency clock pulse generator with modulo math and dynamic strip-chart plotting.',
    graph: {
      nodes: [
        {
          id: 'n_clock',
          type: 'clock_pulse',
          x: 80,
          y: 140,
          state: { intervalMs: 80, isRunning: true }
        },
        {
          id: 'n_mod_base',
          type: 'number_slider',
          x: 80,
          y: 340,
          state: { label: 'Modulo Cycle', min: 10, max: 100, step: 5, value: 50 }
        },
        {
          id: 'n_mod',
          type: 'math_op',
          x: 380,
          y: 200,
          state: { op: 'mod' }
        },
        {
          id: 'n_spark',
          type: 'sparkline_chart',
          x: 680,
          y: 140,
          state: { historySize: 45 }
        },
        {
          id: 'n_gauge',
          type: 'gauge_meter',
          x: 680,
          y: 300,
          state: { min: 0, max: 50, unit: 'pts' }
        }
      ],
      wires: [
        { fromNode: 'n_clock', fromPort: 'count', toNode: 'n_mod', toPort: 'a' },
        { fromNode: 'n_mod_base', fromPort: 'val', toNode: 'n_mod', toPort: 'b' },
        { fromNode: 'n_mod', fromPort: 'result', toNode: 'n_spark', toPort: 'val' },
        { fromNode: 'n_mod', fromPort: 'result', toNode: 'n_gauge', toPort: 'val' }
      ]
    }
  }
};

window.FACTORY_BLUEPRINTS = FACTORY_BLUEPRINTS;
