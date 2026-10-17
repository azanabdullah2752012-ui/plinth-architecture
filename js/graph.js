/**
 * KNOT // Reactive DAG Graph & Execution Engine
 * Topological sort, cycle-safe propagation, and wire data pulse emission
 */

class ReactiveGraph {
  constructor() {
    this.nodes = new Map(); // id -> NodeInstance
    this.wires = []; // Array<{ id, fromNode, fromPort, toNode, toPort }>
    this.listeners = new Set();
    this.wireListeners = new Set();
    this.clockIntervals = new Map();
  }

  addNode(type, x = 100, y = 100, customState = null, id = null) {
    const def = window.NODE_DEFINITIONS[type];
    if (!def) throw new Error(`Unknown node type: ${type}`);

    const nodeId = id || 'node_' + Math.random().toString(36).substr(2, 9);
    const state = Object.assign({}, def.defaultState, customState || {});

    const nodeInstance = {
      id: nodeId,
      type: type,
      title: def.title,
      category: def.category,
      accent: def.accent,
      inputs: def.inputs.map(i => ({ ...i })),
      outputs: def.outputs.map(o => ({ ...o })),
      state: state,
      inputValues: {},
      outputValues: {},
      x: x,
      y: y,
      domElement: null,
      _updateDisplay: null
    };

    this.nodes.set(nodeId, nodeInstance);

    // If clock node, start internal interval
    if (type === 'clock_pulse') {
      this.setupClockNode(nodeInstance);
    }

    this.evaluate();
    this.notify();
    return nodeInstance;
  }

  removeNode(nodeId) {
    // Clear clock if exists
    if (this.clockIntervals.has(nodeId)) {
      clearInterval(this.clockIntervals.get(nodeId));
      this.clockIntervals.delete(nodeId);
    }

    // Remove wires attached to node
    this.wires = this.wires.filter(w => w.fromNode !== nodeId && w.toNode !== nodeId);
    this.nodes.delete(nodeId);
    this.evaluate();
    this.notify();
  }

  updateNodeState(nodeId, newState) {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    Object.assign(node.state, newState);

    if (node.type === 'clock_pulse') {
      this.setupClockNode(node);
    }

    this.evaluate();
  }

  setupClockNode(node) {
    if (this.clockIntervals.has(node.id)) {
      clearInterval(this.clockIntervals.get(node.id));
      this.clockIntervals.delete(node.id);
    }

    if (!node.state.isRunning) return;

    const interval = Math.max(30, node.state.intervalMs || 500);
    const timer = setInterval(() => {
      node.state.count = (node.state.count || 0) + 1;
      this.evaluate();
    }, interval);

    this.clockIntervals.set(node.id, timer);
  }

  addWire(fromNode, fromPort, toNode, toPort) {
    // Prevent duplicate wires to the same input port
    this.wires = this.wires.filter(w => !(w.toNode === toNode && w.toPort === toPort));

    const wire = {
      id: 'wire_' + Math.random().toString(36).substr(2, 9),
      fromNode,
      fromPort,
      toNode,
      toPort
    };

    this.wires.push(wire);
    this.evaluate();
    this.notify();
    return wire;
  }

  removeWire(wireId) {
    this.wires = this.wires.filter(w => w.id !== wireId);
    this.evaluate();
    this.notify();
  }

  // Topological sorting (Kahn's Algorithm)
  getEvaluationOrder() {
    const inDegree = new Map();
    const adj = new Map();

    for (let id of this.nodes.keys()) {
      inDegree.set(id, 0);
      adj.set(id, []);
    }

    for (let wire of this.wires) {
      if (this.nodes.has(wire.fromNode) && this.nodes.has(wire.toNode)) {
        adj.get(wire.fromNode).push(wire.toNode);
        inDegree.set(wire.toNode, (inDegree.get(wire.toNode) || 0) + 1);
      }
    }

    const queue = [];
    for (let [id, deg] of inDegree.entries()) {
      if (deg === 0) queue.push(id);
    }

    const order = [];
    while (queue.length > 0) {
      const u = queue.shift();
      order.push(u);

      for (let v of adj.get(u) || []) {
        inDegree.set(v, inDegree.get(v) - 1);
        if (inDegree.get(v) === 0) {
          queue.push(v);
        }
      }
    }

    // Append any isolated or cycle nodes
    for (let id of this.nodes.keys()) {
      if (!order.includes(id)) {
        order.push(id);
      }
    }

    return order;
  }

  evaluate() {
    const order = this.getEvaluationOrder();

    // Clear input maps
    for (let node of this.nodes.values()) {
      node.inputValues = {};
    }

    // Pull values through wires
    for (let nodeId of order) {
      const node = this.nodes.get(nodeId);
      if (!node) continue;

      // Collect inputs from incoming wires
      const incomingWires = this.wires.filter(w => w.toNode === nodeId);
      for (let wire of incomingWires) {
        const sourceNode = this.nodes.get(wire.fromNode);
        if (sourceNode && sourceNode.outputValues[wire.fromPort] !== undefined) {
          node.inputValues[wire.toPort] = sourceNode.outputValues[wire.fromPort];
          // Trigger wire pulse animation
          this.emitWirePulse(wire.id);
        }
      }

      // Execute node definition
      const def = window.NODE_DEFINITIONS[node.type];
      if (def && def.evaluate) {
        try {
          node.outputValues = def.evaluate(node.inputValues, node.state) || {};
        } catch (err) {
          console.warn(`Evaluation error in node ${node.id}:`, err);
        }
      }

      // Update sink visualizer if applicable
      if (typeof node._updateDisplay === 'function') {
        node._updateDisplay(node.inputValues);
      }
    }
  }

  emitWirePulse(wireId) {
    this.wireListeners.forEach(fn => fn(wireId));
  }

  onWirePulse(callback) {
    this.wireListeners.add(callback);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  clear() {
    for (let timer of this.clockIntervals.values()) {
      clearInterval(timer);
    }
    this.clockIntervals.clear();
    this.wires = [];
    this.nodes.clear();
    this.notify();
  }

  toJSON() {
    return {
      nodes: Array.from(this.nodes.values()).map(n => ({
        id: n.id,
        type: n.type,
        x: n.x,
        y: n.y,
        state: n.state
      })),
      wires: this.wires.map(w => ({
        fromNode: w.fromNode,
        fromPort: w.fromPort,
        toNode: w.toNode,
        toPort: w.toPort
      }))
    };
  }

  fromJSON(data) {
    this.clear();
    if (!data || !Array.isArray(data.nodes)) return;

    for (let n of data.nodes) {
      this.addNode(n.type, n.x, n.y, n.state, n.id);
    }

    if (Array.isArray(data.wires)) {
      for (let w of data.wires) {
        this.addWire(w.fromNode, w.fromPort, w.toNode, w.toPort);
      }
    }

    this.evaluate();
    this.notify();
  }
}

window.ReactiveGraph = ReactiveGraph;
