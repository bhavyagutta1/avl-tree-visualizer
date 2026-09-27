/*
 * AVL Tree Visualizer
 * The AVLTree class contains the data-structure logic. The code at the end
 * connects that logic to the webpage and draws the current tree as SVG.
 */

class AVLNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

class AVLTree {
  constructor() {
    this.root = null;
    this.lastRotation = null;
  }

  height(node) { return node ? node.height : 0; }

  balanceFactor(node) {
    return node ? this.height(node.left) - this.height(node.right) : 0;
  }

  updateHeight(node) {
    node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
  }

  rotateRight(top) {
    const newTop = top.left;
    const middle = newTop.right;
    newTop.right = top;
    top.left = middle;
    this.updateHeight(top);
    this.updateHeight(newTop);
    return newTop;
  }

  rotateLeft(top) {
    const newTop = top.right;
    const middle = newTop.left;
    newTop.left = top;
    top.right = middle;
    this.updateHeight(top);
    this.updateHeight(newTop);
    return newTop;
  }

  rebalance(node) {
    this.updateHeight(node);
    const balance = this.balanceFactor(node);

    if (balance > 1) {
      if (this.balanceFactor(node.left) < 0) {
        this.lastRotation = 'LR case: left rotation, then right rotation';
        node.left = this.rotateLeft(node.left);
      } else {
        this.lastRotation = 'LL case: right rotation';
      }
      return this.rotateRight(node);
    }

    if (balance < -1) {
      if (this.balanceFactor(node.right) > 0) {
        this.lastRotation = 'RL case: right rotation, then left rotation';
        node.right = this.rotateRight(node.right);
      } else {
        this.lastRotation = 'RR case: left rotation';
      }
      return this.rotateLeft(node);
    }

    return node;
  }

  insert(value) {
    this.lastRotation = null;
    let added = false;
    const add = (node) => {
      if (!node) { added = true; return new AVLNode(value); }
      if (value < node.value) node.left = add(node.left);
      else if (value > node.value) node.right = add(node.right);
      else return node; // This visualizer treats values as unique.
      return this.rebalance(node);
    };
    this.root = add(this.root);
    return { added, rotation: this.lastRotation };
  }

  minimumNode(node = this.root) {
    if (!node) return null;
    while (node.left) node = node.left;
    return node;
  }

  maximumNode(node = this.root) {
    if (!node) return null;
    while (node.right) node = node.right;
    return node;
  }

  search(value) {
    let node = this.root;
    while (node) {
      if (value === node.value) return node;
      node = value < node.value ? node.left : node.right;
    }
    return null;
  }

  delete(value) {
    this.lastRotation = null;
    let removed = false;
    const remove = (node) => {
      if (!node) return null;
      if (value < node.value) node.left = remove(node.left);
      else if (value > node.value) node.right = remove(node.right);
      else {
        removed = true;
        if (!node.left) return node.right;
        if (!node.right) return node.left;
        const successor = this.minimumNode(node.right);
        node.value = successor.value;
        node.right = removeValue(node.right, successor.value);
      }
      return this.rebalance(node);
    };
    const removeValue = (node, target) => {
      if (!node) return null;
      if (target < node.value) node.left = removeValue(node.left, target);
      else if (target > node.value) node.right = removeValue(node.right, target);
      else return node.right || node.left;
      return this.rebalance(node);
    };
    this.root = remove(this.root);
    return { removed, rotation: this.lastRotation };
  }

  valuesInOrder() {
    const values = [];
    const visit = (node) => {
      if (!node) return;
      visit(node.left); values.push(node.value); visit(node.right);
    };
    visit(this.root);
    return values;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AVLNode, AVLTree };
}

if (typeof document !== 'undefined') {
  const tree = new AVLTree();
  const form = document.querySelector('#value-form');
  const input = document.querySelector('#value-input');
  const canvas = document.querySelector('#tree-canvas');
  const status = document.querySelector('#status-message');
  const count = document.querySelector('#node-count');
  const rotationPanel = document.querySelector('#rotation-panel');
  const rotationTitle = document.querySelector('#rotation-title');
  const rotationDetail = document.querySelector('#rotation-detail');

  function announce(message) { status.textContent = message; }

  function explainRotation(rotation) {
    rotationPanel.classList.toggle('is-active', Boolean(rotation));
    if (!rotation) {
      rotationTitle.textContent = 'No rotation needed';
      rotationDetail.textContent = 'This operation left every node balanced, so the tree shape did not need a rotation.';
      return;
    }
    const explanations = {
      LL: ['LL imbalance detected', 'The new value went into the left subtree of the left child. A right rotation fixes the imbalance.'],
      RR: ['RR imbalance detected', 'The new value went into the right subtree of the right child. A left rotation fixes the imbalance.'],
      LR: ['LR imbalance detected', 'The new value went into the right subtree of the left child. First rotate left at the child, then rotate right at the unbalanced node.'],
      RL: ['RL imbalance detected', 'The new value went into the left subtree of the right child. First rotate right at the child, then rotate left at the unbalanced node.'],
    };
    const key = rotation.slice(0, 2);
    const [title, detail] = explanations[key];
    rotationTitle.textContent = title;
    rotationDetail.textContent = `${detail} Operation: ${rotation.split(': ')[1]}.`;
  }

  function readValue() {
    const value = Number(input.value);
    if (input.value.trim() === '' || !Number.isSafeInteger(value)) {
      announce('Enter a whole number within JavaScript’s safe integer range.');
      input.focus();
      return null;
    }
    return value;
  }

  function addNode(parent, child, positions) {
    if (!child) return;
    const index = positions.length;
    if (child.left) addNode(child, child.left, positions);
    const currentIndex = positions.length;
    positions.push({ node: child, x: 58 + currentIndex * 78, y: 52 + child.depth * 88 });
    if (child.right) addNode(child, child.right, positions);
  }

  function drawTree() {
    const values = tree.valuesInOrder();
    count.textContent = `${values.length} ${values.length === 1 ? 'node' : 'nodes'}`;
    if (!tree.root) {
      canvas.setAttribute('aria-label', 'The AVL tree is empty');
      canvas.innerHTML = '<p class="empty-state">Your tree is empty. Insert a number to begin.</p>';
      return;
    }

    // In-order positions keep the smaller values on the left and larger values on the right.
    const positions = [];
    const place = (node, depth = 0) => {
      if (!node) return;
      place(node.left, depth + 1);
      positions.push({ node, x: 48 + positions.length * 82, y: 52 + depth * 88 });
      place(node.right, depth + 1);
    };
    place(tree.root);
    const byNode = new Map(positions.map((entry) => [entry.node, entry]));
    const maxDepth = Math.max(...positions.map((entry) => entry.y));
    const width = Math.max(420, positions.length * 82 + 24);
    const height = maxDepth + 52;
    let svg = `<svg class="tree-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true">`;
    for (const { node, x, y } of positions) {
      for (const child of [node.left, node.right]) {
        if (!child) continue;
        const target = byNode.get(child);
        svg += `<line class="tree-edge" x1="${x}" y1="${y + 22}" x2="${target.x}" y2="${target.y - 22}" />`;
      }
    }
    for (const { node, x, y } of positions) {
      svg += `<circle class="tree-node" cx="${x}" cy="${y}" r="23" />`;
      svg += `<text class="tree-value" x="${x}" y="${y}">${node.value}</text>`;
      svg += `<text class="tree-bf" x="${x}" y="${y + 39}">BF ${tree.balanceFactor(node)}</text>`;
    }
    svg += '</svg>';
    canvas.setAttribute('aria-label', `AVL tree with values ${values.join(', ')}`);
    canvas.innerHTML = svg;
  }

  function doInsert() {
    const value = readValue(); if (value === null) return;
    const result = tree.insert(value);
    if (!result.added) { announce(`${value} is already in the tree. Duplicate values are ignored.`); explainRotation(null); }
    else {
      announce(result.rotation ? `Inserted ${value}. ${result.rotation}.` : `Inserted ${value}. The tree is balanced.`);
      explainRotation(result.rotation);
    }
    drawTree(); input.select();
  }

  form.addEventListener('submit', (event) => { event.preventDefault(); doInsert(); });
  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (action === 'insert') { doInsert(); return; }
      if (action === 'reset') {
        tree.root = null; tree.lastRotation = null; drawTree(); announce('Tree reset. Insert a number to begin.');
        rotationTitle.textContent = 'Waiting for an imbalance';
        rotationDetail.textContent = 'Insert numbers to see which AVL case is detected and how the tree is rebalanced.';
        rotationPanel.classList.remove('is-active');
        return;
      }
      const value = readValue(); if (value === null) return;
      if (action === 'delete') {
        const result = tree.delete(value);
        announce(result.removed ? `Deleted ${value}.${result.rotation ? ` ${result.rotation}.` : ' The tree is balanced.'}` : `${value} was not found, so nothing was deleted.`);
        explainRotation(result.removed ? result.rotation : null);
      } else if (action === 'search') {
        announce(tree.search(value) ? `${value} is in the tree.` : `${value} is not in the tree.`);
        explainRotation(null);
      } else if (action === 'min' || action === 'max') {
        const node = action === 'min' ? tree.minimumNode() : tree.maximumNode();
        announce(node ? `${action === 'min' ? 'Minimum' : 'Maximum'} value: ${node.value}.` : 'The tree is empty. Insert a number first.');
      }
      drawTree();
    });
  });
  drawTree();
}
