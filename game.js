const boardSize = 10;
const board = [];
const playerUnits = [];
const enemyUnits = [];
const bases = [];
let selectedUnit = null;

// Initialize the game board
const gameBoard = document.getElementById('game-board');
for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.x = x;
        tile.dataset.y = y;
        tile.addEventListener('click', () => handleTileClick(x, y));
        gameBoard.appendChild(tile);
        board.push({ x, y, unit: null, base: null });
    }
}

// Add a base
function addBase(x, y, owner) {
    const baseTile = getTile(x, y);
    baseTile.base = owner;
    const baseElement = document.createElement('div');
    baseElement.className = 'base';
    baseTile.element.appendChild(baseElement);
    bases.push({ x, y, owner });
}

// Add a unit
function addUnit(x, y, owner) {
    const unit = { x, y, owner, hp: 20 };
    const unitTile = getTile(x, y);
    const unitElement = document.createElement('div');
    unitElement.className = `unit ${owner === 'enemy' ? 'enemy' : ''}`;
    unitTile.unit = unit;
    unitTile.element.appendChild(unitElement);
    (owner === 'player' ? playerUnits : enemyUnits).push(unit);
}

// Get tile by coordinates
function getTile(x, y) {
    return board.find(tile => tile.x === x && tile.y === y);
}

// Handle tile clicks
function handleTileClick(x, y) {
    const tile = getTile(x, y);
    if (selectedUnit) {
        moveUnit(selectedUnit, x, y);
        selectedUnit = null;
    } else if (tile.unit && tile.unit.owner === 'player') {
        selectedUnit = tile.unit;
    }
}

// Move a unit
function moveUnit(unit, x, y) {
    const oldTile = getTile(unit.x, unit.y);
    const newTile = getTile(x, y);

    // Check for combat
    if (newTile.unit) {
        if (newTile.unit.owner !== unit.owner) {
            resolveCombat(unit, newTile.unit, unit.x - x, unit.y - y);
        }
    } else {
        oldTile.unit = null;
        newTile.unit = unit;
        unit.x = x;
        unit.y = y;

        // Update DOM
        const unitElement = oldTile.element.querySelector('.unit');
        oldTile.element.removeChild(unitElement);
        newTile.element.appendChild(unitElement);
    }
}

// Combat mechanics
function resolveCombat(attacker, defender, dx, dy) {
    const isFlank = dx === 0 || dy === 0;
    if (isFlank) {
        defender.hp -= 10;
        if (defender.hp <= 0) {
            removeUnit(defender);
        }
    } else {
        attacker.hp -= 5;
        defender.hp -= 5;
        if (attacker.hp <= 0) removeUnit(attacker);
        if (defender.hp <= 0) removeUnit(defender);
    }
}

// Remove a unit
function removeUnit(unit) {
    const tile = getTile(unit.x, unit.y);
    tile.unit = null;
    const unitArray = unit.owner === 'player' ? playerUnits : enemyUnits;
    const index = unitArray.indexOf(unit);
    if (index !== -1) unitArray.splice(index, 1);
    const unitElement = tile.element.querySelector('.unit');
    tile.element.removeChild(unitElement);
}

// Initialize the game
addBase(0, 0, 'player');
addBase(9, 9, 'enemy');
addUnit(1, 1, 'player');
addUnit(8, 8, 'enemy');