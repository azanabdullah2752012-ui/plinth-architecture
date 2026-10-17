/**
 * KNOT // Main Application Coordinator & Canvas DOM Controller
 * Node rendering, port wiring, dragging, and keyboard shortcuts
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('canvas-container');
  const graph = new ReactiveGraph();
  const canvas = new InfiniteCanvas(container, graph);

  let selectedNodeId = null;
  let activeDragNode = null;
  let dragOffset = { x: 0, y: 0 };

  // --- Render Nodes into DOM Layer ---
  function syncDomNodes() {
    const layer = canvas.nodeLayer;
    const existingIds = new Set();

    graph.nodes.forEach((node) => {
      existingIds.add(node.id);
      if (!node.domElement) {
        node.domElement = createNodeElement(node);
        layer.appendChild(node.domElement);
      }
      // Update position
      node.domElement.style.transform = `translate(${node.x}px, ${node.y}px)`;
      node.domElement.classList.toggle('is-selected', node.id === selectedNodeId);
    });

    // Remove defunct DOM elements
    Array.from(layer.children).forEach((child) => {
      if (!existingIds.has(child.dataset.nodeId)) {
        layer.removeChild(child);
      }
    });
  }

  function createNodeElement(node) {
    const def = window.NODE_DEFINITIONS[node.type];
    const el = document.createElement('div');
    el.className = 'canvas-node';
    el.dataset.nodeId = node.id;
    el.style.borderTopColor = node.accent || '#3b4352';

    // Header
    const header = document.createElement('div');
    header.className = 'node-header';
    header.style.borderLeftColor = node.accent || '#3b4352';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'node-title-wrap';

    const title = document.createElement('span');
    title.className = 'node-title';
    title.textContent = node.title;

    const catBadge = document.createElement('span');
    catBadge.className = 'node-cat-badge';
    catBadge.textContent = node.category.toUpperCase().split(' ')[0];

    titleWrap.appendChild(title);
    titleWrap.appendChild(catBadge);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'node-close-btn';
    closeBtn.innerHTML = '×';
    closeBtn.title = 'Delete Node';
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      graph.removeNode(node.id);
    };

    header.appendChild(titleWrap);
    header.appendChild(closeBtn);

    // Ports & Content Stack
    const body = document.createElement('div');
    body.className = 'node-body';

    // Port Rows
    const portsRow = document.createElement('div');
    portsRow.className = 'node-ports-row';

    const inputCol = document.createElement('div');
    inputCol.className = 'node-ports-col inputs';
    node.inputs.forEach((input) => {
      const portRow = document.createElement('div');
      portRow.className = 'port-item';

      const portBullet = document.createElement('div');
      portBullet.className = 'node-port is-input';
      portBullet.dataset.port = input.id;
      portBullet.dataset.nodeId = node.id;

      setupPortDrag(portBullet, node.id, input.id, false);

      const label = document.createElement('span');
      label.className = 'port-label';
      label.textContent = input.label;

      portRow.appendChild(portBullet);
      portRow.appendChild(label);
      inputCol.appendChild(portRow);
    });

    const outputCol = document.createElement('div');
    outputCol.className = 'node-ports-col outputs';
    node.outputs.forEach((output) => {
      const portRow = document.createElement('div');
      portRow.className = 'port-item';

      const label = document.createElement('span');
      label.className = 'port-label';
      label.textContent = output.label;

      const portBullet = document.createElement('div');
      portBullet.className = 'node-port is-output';
      portBullet.dataset.port = output.id;
      portBullet.dataset.nodeId = node.id;

      setupPortDrag(portBullet, node.id, output.id, true);

      portRow.appendChild(label);
      portRow.appendChild(portBullet);
      outputCol.appendChild(portRow);
    });

    portsRow.appendChild(inputCol);
    portsRow.appendChild(outputCol);

    // Custom UI
    const customContent = document.createElement('div');
    customContent.className = 'node-custom-ui';
    if (def && def.renderUI) {
      const rendered = def.renderUI(node, node.state, (newState) => {
        graph.updateNodeState(node.id, newState);
      });
      if (rendered) customContent.appendChild(rendered);
    }

    body.appendChild(portsRow);
    body.appendChild(customContent);

    el.appendChild(header);
    el.appendChild(body);

    // Dragging node via header
    header.addEventListener('pointerdown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      e.stopPropagation();
      activeDragNode = node;
      selectedNodeId = node.id;
      syncDomNodes();

      const world = canvas.screenToWorld(e.clientX, e.clientY);
      dragOffset = {
        x: world.x - node.x,
        y: world.y - node.y
      };
    });

    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      selectedNodeId = node.id;
      syncDomNodes();
    });

    return el;
  }

  // Handle port click/drag wiring
  function setupPortDrag(portEl, nodeId, portId, isOutput) {
    portEl.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();

      // If clicking on an input port that already has a wire, disconnect it
      if (!isOutput) {
        const existingWire = graph.wires.find(w => w.toNode === nodeId && w.toPort === portId);
        if (existingWire) {
          graph.removeWire(existingWire.id);
          return;
        }
      }

      canvas.startDraggingWire(nodeId, portId, isOutput, portEl);
    });

    portEl.addEventListener('pointerup', (e) => {
      if (!canvas.activeDragPort) return;
      e.stopPropagation();

      const source = canvas.activeDragPort;
      // Cannot connect to itself
      if (source.nodeId === nodeId) return;

      // Output -> Input connection
      if (source.isOutput && !isOutput) {
        graph.addWire(source.nodeId, source.portId, nodeId, portId);
      } else if (!source.isOutput && isOutput) {
        graph.addWire(nodeId, portId, source.nodeId, source.portId);
      }
      canvas.activeDragPort = null;
    });
  }

  // Node movement tracking
  window.addEventListener('pointermove', (e) => {
    if (activeDragNode) {
      const world = canvas.screenToWorld(e.clientX, e.clientY);
      activeDragNode.x = Math.round((world.x - dragOffset.x) / 12) * 12; // snap 12px
      activeDragNode.y = Math.round((world.y - dragOffset.y) / 12) * 12;
      activeDragNode.domElement.style.transform = `translate(${activeDragNode.x}px, ${activeDragNode.y}px)`;
    }
  });

  window.addEventListener('pointerup', () => {
    if (activeDragNode) {
      activeDragNode = null;
    }
  });

  // Subscribe to graph changes to keep DOM in sync
  graph.subscribe(() => {
    syncDomNodes();
  });

  // --- Add Node Menu / Catalog ---
  const addNodeModal = document.getElementById('add-node-modal');
  const addNodeSearch = document.getElementById('add-node-search');
  const addNodeList = document.getElementById('add-node-list');

  function openAddNodeModal(spawnX = null, spawnY = null) {
    addNodeModal.classList.remove('is-hidden');
    addNodeSearch.value = '';
    addNodeSearch.focus();
    renderAddNodeCatalog('', spawnX, spawnY);
  }

  function closeAddNodeModal() {
    addNodeModal.classList.add('is-hidden');
  }

  function renderAddNodeCatalog(query = '', spawnX = null, spawnY = null) {
    addNodeList.innerHTML = '';
    const q = query.toLowerCase();

    Object.entries(window.NODE_DEFINITIONS).forEach(([type, def]) => {
      if (q && !def.title.toLowerCase().includes(q) && !def.category.toLowerCase().includes(q)) {
        return;
      }

      const item = document.createElement('div');
      item.className = 'node-catalog-item';

      const left = document.createElement('div');
      left.className = 'catalog-item-info';
      const title = document.createElement('span');
      title.className = 'catalog-item-title';
      title.textContent = def.title;
      const cat = document.createElement('span');
      cat.className = 'catalog-item-cat';
      cat.textContent = def.category;
      left.appendChild(title);
      left.appendChild(cat);

      const addBtn = document.createElement('span');
      addBtn.className = 'catalog-add-badge';
      addBtn.textContent = '+ ADD';

      item.appendChild(left);
      item.appendChild(addBtn);

      item.onclick = () => {
        const center = spawnX !== null 
          ? { x: spawnX, y: spawnY } 
          : canvas.screenToWorld(canvas.width / 2, canvas.height / 2);
        graph.addNode(type, center.x - 100, center.y - 60);
        closeAddNodeModal();
      };

      addNodeList.appendChild(item);
    });
  }

  addNodeSearch?.addEventListener('input', (e) => {
    renderAddNodeCatalog(e.target.value);
  });

  document.getElementById('btn-add-node')?.addEventListener('click', () => {
    openAddNodeModal();
  });

  document.getElementById('btn-close-modal')?.addEventListener('click', closeAddNodeModal);

  // Double-click empty canvas to open node menu at cursor
  container.addEventListener('dblclick', (e) => {
    if (e.target === container || e.target === canvas.canvasLayer || e.target === canvas.nodeLayer) {
      const rect = container.getBoundingClientRect();
      const world = canvas.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      openAddNodeModal(world.x, world.y);
    }
  });

  // --- Toolbar Actions ---
  document.getElementById('btn-center')?.addEventListener('click', () => {
    canvas.centerView();
  });

  document.getElementById('btn-clear')?.addEventListener('click', () => {
    if (confirm('Clear entire workspace?')) {
      graph.clear();
      syncDomNodes();
    }
  });

  // Blueprints loader
  const blueprintSelect = document.getElementById('blueprint-select');
  blueprintSelect?.addEventListener('change', (e) => {
    const bp = window.FACTORY_BLUEPRINTS[e.target.value];
    if (bp) {
      graph.fromJSON(bp.graph);
      document.getElementById('blueprint-desc').textContent = bp.description;
      setTimeout(() => canvas.centerView(), 50);
    }
  });

  // Export JSON
  document.getElementById('btn-export')?.addEventListener('click', () => {
    const json = JSON.stringify(graph.toJSON(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knot-pipeline-${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  });

  // Import JSON
  const fileInput = document.getElementById('import-file-input');
  document.getElementById('btn-import')?.addEventListener('click', () => {
    fileInput?.click();
  });
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        graph.fromJSON(data);
        setTimeout(() => canvas.centerView(), 50);
      } catch (err) {
        alert('Invalid pipeline JSON file.');
      }
    };
    reader.readAsText(file);
    fileInput.value = '';
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.code === 'Delete' || e.code === 'Backspace') {
      if (selectedNodeId) {
        graph.removeNode(selectedNodeId);
        selectedNodeId = null;
      }
    } else if (e.code === 'Escape') {
      closeAddNodeModal();
      selectedNodeId = null;
      syncDomNodes();
    } else if (e.code === 'KeyA' && (e.shiftKey || e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      openAddNodeModal();
    }
  });

  // Load default blueprint
  const defaultBp = window.FACTORY_BLUEPRINTS['pricing_pipeline'];
  if (defaultBp) {
    graph.fromJSON(defaultBp.graph);
    document.getElementById('blueprint-desc').textContent = defaultBp.description;
    setTimeout(() => canvas.centerView(), 80);
  }
});
