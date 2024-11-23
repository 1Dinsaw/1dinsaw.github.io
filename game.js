const boardSize = 10;
const board = [];
const playerUnits = [];
const enemyUnits = [];
const bases = [];
let selectedUnit = null;
let currentTurn = 'player';

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
        board.push({ x, y, unit: null, base: null, element: tile });
    }
}

// Add a base
function addBase(x, y, owner) {
    const baseTile = getTile(x, y);
    baseTile.base = owner;
    const baseElement = document.createElement('div');
    baseElement.className = 'base';
    baseElement.textContent = owner === 'player' ? 'P' : 'E';
    baseTile.element.appendChild(baseElement);
    bases.push({ x, y, owner });
}

// Add a unit
function addUnit(x, y, owner) {
    const unit = { x, y, owner, hp: 20 };
    const unitTile = getTile(x, y);
    const unitElement = document.createElement('div');
    unitElement.className = `unit ${owner === 'enemy' ? 'enemy' : ''}`;

    // Add health bar
    const healthBar = document.createElement('div');
    healthBar.className = 'health-bar';
    const healthBarInner = document.createElement('div');
    healthBarInner.className = 'health-bar-inner';
    healthBar.appendChild(healthBarInner);
    unitElement.appendChild(healthBar);

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
        if (isValidMove(x, y)) {
            moveUnit(selectedUnit, x, y);
            clearHighlights();
            selectedUnit = null;
            endTurn();
        }
    } else if (tile.unit && tile.unit.owner === currentTurn) {
        selectedUnit = tile.unit;
        highlightValidMoves(selectedUnit);
    }
}

// Highlight valid moves
function highlightValidMoves(unit) {
    clearHighlights();
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const nx = unit.x + dx;
            const ny = unit.y + dy;
            const targetTile = getTile(nx, ny);
            if (targetTile && !targetTile.unit) {
                targetTile.element.classList.add('valid-move');
            }
        }
    }
}

// Clear highlights
function clearHighlights() {
    document.querySelectorAll('.tile.valid-move').forEach(tile => {
        tile.classList.remove('valid-move');
    });
}

// Move a unit
function moveUnit(unit, x, y) {
    const oldTile = getTile(unit.x, unit.y);
    const newTile = getTile(x, y);

    // Check for combat
    if (newTile.unit) {
        if (newTile.unit.owner !== unit.owner) {
            resolveCombat(unit, newTile.unit);
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
function resolveCombat(attacker, defender) {
    defender.hp -= 10;
    if (defender.hp <= 0) {
        removeUnit(defender);
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

// End the turn
function endTurn() {
    currentTurn = currentTurn === 'player' ? 'enemy' : 'player';
    document.getElementById('turn-indicator').textContent = `${currentTurn.toUpperCase()}'s Turn`;
}

// Initialize the game
document.body.insertAdjacentHTML('afterbegin', '<div id="turn-indicator">PLAYER\'s Turn</div>');
addBase(0, 0, 'player');
addBase(9, 9, 'enemy');
addUnit(1, 1, 'player');
addUnit(8, 8, 'enemy');