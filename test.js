// Run with: node test.js
const assert = require('node:assert/strict');
const { AVLTree } = require('./script.js');

const examples = [
  { name: 'LL', values: [30, 20, 10], root: 20 },
  { name: 'RR', values: [10, 20, 30], root: 20 },
  { name: 'LR', values: [30, 10, 20], root: 20 },
  { name: 'RL', values: [10, 30, 20], root: 20 },
];

function checkBalance(node) {
  if (!node) return 0;
  const leftHeight = checkBalance(node.left);
  const rightHeight = checkBalance(node.right);
  assert.ok(Math.abs(leftHeight - rightHeight) <= 1, `node ${node.value} is unbalanced`);
  assert.equal(node.height, 1 + Math.max(leftHeight, rightHeight), `wrong stored height at ${node.value}`);
  return node.height;
}

for (const example of examples) {
  const tree = new AVLTree();
  let lastResult;
  for (const value of example.values) lastResult = tree.insert(value);
  assert.equal(tree.root.value, example.root, `${example.name} should make 20 the root`);
  assert.deepEqual(tree.valuesInOrder(), [10, 20, 30]);
  assert.ok(lastResult.rotation.startsWith(`${example.name} case`), `should report ${example.name}`);
  checkBalance(tree.root);
  console.log(`PASS ${example.name}: ${example.values.join(', ')} -> root ${tree.root.value}; ${lastResult.rotation}`);
}

const tree = new AVLTree();
[20, 10, 30, 25, 40, 22].forEach((value) => tree.insert(value));
assert.equal(tree.search(25).value, 25);
assert.equal(tree.search(99), null);
assert.equal(tree.minimumNode().value, 10);
assert.equal(tree.maximumNode().value, 40);
assert.equal(tree.delete(30).removed, true);
assert.deepEqual(tree.valuesInOrder(), [10, 20, 22, 25, 40]);
checkBalance(tree.root);
console.log('PASS search, minimum, maximum, and deletion');
