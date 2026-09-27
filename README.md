# AVL Tree Visualizer

A small interactive website demonstrating how an AVL tree keeps a binary search tree balanced. It uses HTML, CSS, and JavaScript, with no framework or package installation.

When insertion or deletion causes rebalancing, the **Rotation Explained** panel identifies the LL, RR, LR, or RL case, explains why it happened, and names the rotation step or steps.

## Run the website

Open `index.html` in a modern web browser. Enter an integer and use Insert, Delete, or Search. The minimum, maximum, and reset buttons are below the input. Each node displays its balance factor.

To demonstrate the four insertion rotations, reset between examples and insert the numbers in this order:

| Case | Insert in order | Rotation |
| --- | --- | --- |
| LL | 30, 20, 10 | Right rotation |
| RR | 10, 20, 30 | Left rotation |
| LR | 30, 10, 20 | Left, then right rotation |
| RL | 10, 30, 20 | Right, then left rotation |

## Check the AVL logic

With Node.js installed, run this from the project folder:

```sh
node test.js
```

The checks confirm each rotation produces root `20`, keeps the values in sorted order, and leaves the tree balanced. They also check search, minimum, maximum, and deletion.

## Files

- `index.html` — page structure and controls
- `style.css` — layout, colors, and responsive styles
- `script.js` — AVL operations, rotation explanations, and SVG drawing
- `test.js` — rotation and operation checks

## Publish with Git and GitHub

Create an empty repository on GitHub. Open a terminal in this folder and run these commands, replacing the example URL with your repository URL:

```sh
git init
git add index.html style.css script.js test.js README.md
git commit -m "Build AVL tree visualizer"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/avl-tree-visualizer.git
git push -u origin main
```
