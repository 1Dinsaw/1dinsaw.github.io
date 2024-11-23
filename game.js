const boardSize = 10;
const board = [];
const playerUnits = [];
const enemyUnits = [];
const bases = [];
let selectedUnit = null;
let currentTurn = 'player';

// Initialize the game board
const gameBoard = document.getElementById('game-board');
if (!gameBoard) {
    console.error("Game board element (#game-board) not found!");
}

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
    if (!baseTile) {
        console.error(`Invalid base coordinates: (${x}, ${y})`);
        return;
    }
    baseTile.base = owner;
    const baseElement = document.createElement('div');
    baseElement.className = 'base';
    baseElement.textContent = owner === 'player' ? 'P' : 'E';
    baseTile.element.appendChild(baseElement);
    bases.push({ x, y, owner });
}

// Add a unit
function addUnit(x, y, owner, type = 'default') {
    const unit = { x, y, owner, hp: 20, attackPower: 10, attackRange: 1 };
    if (type === 'archer') {
        unit.attackRange = 3; // Archers have a 3-tile attack range
    }
    const unitTile = getTile(x, y);
    if (!unitTile) {
        console.error(`Invalid unit coordinates: (${x}, ${y})`);
        return;
    }

    const unitElement = document.createElement('div');
    unitElement.className = `unit ${owner === 'enemy' ? 'enemy' : ''}`;

    // Add health bar
    const healthBar = document.createElement('div');
    healthBar.className = 'health-bar';
    const healthBarInner = document.createElement('div');
    healthBarInner.className = 'health-bar-inner';
    healthBarInner.style.width = '100%'; // Full health initially
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

    if (!tile) {
        console.error(`Clicked invalid tile at (${x}, ${y})`);
        return;
    }

    if (selectedUnit) {
        const distance = Math.abs(selectedUnit.x - x) + Math.abs(selectedUnit.y - y);
        if (tile.unit && tile.unit.owner !== selectedUnit.owner && distance <= selectedUnit.attackRange) {
            attackUnit(selectedUnit, tile.unit);
            clearHighlights();
            selectedUnit = null;
            endTurn();
        } else if (!tile.unit && isValidMove(x, y)) {
            moveUnit(selectedUnit, x, y);
            clearHighlights();
            selectedUnit = null;
            endTurn();
        }
    } else if (tile.unit && tile.unit.owner === currentTurn) {
        selectedUnit = tile.unit;
        highlightValidActions(selectedUnit);
    }
}

// Highlight valid moves and attacks
function highlightValidActions(unit) {
    clearHighlights();
    for (let dy = -unit.attackRange; dy <= unit.attackRange; dy++) {
        for (let dx = -unit.attackRange; dx <= unit.attackRange; dx++) {
            const nx = unit.x + dx;
            const ny = unit.y + dy;
            const targetTile = getTile(nx, ny);
            if (targetTile) {
                const distance = Math.abs(dx) + Math.abs(dy);
                if (distance <= unit.attackRange) {
                    if (!targetTile.unit) {
                        targetTile.element.classList.add('valid-move');
                    } else if (targetTile.unit.owner !== unit.owner) {
                        targetTile.element.classList.add('valid-attack');
                    }
                }
            }
        }
    }
}

// Clear highlights
function clearHighlights() {
    document.querySelectorAll('.tile.valid-move, .tile.valid-attack').forEach(tile => {
        tile.classList.remove('valid-move', 'valid-attack');
    });
}

// Move a unit
function moveUnit(unit, x, y) {
    const oldTile = getTile(unit.x, unit.y);
    const newTile = getTile(x, y);

    if (!oldTile || !newTile) {
        console.error("Invalid move coordinates");
        return;
    }

    oldTile.unit = null;
    newTile.unit = unit;
    unit.x = x;
    unit.y = y;

    // Update DOM
    const unitElement = oldTile.element.querySelector('.unit');
    oldTile.element.removeChild(unitElement);
    newTile.element.appendChild(unitElement);
}

// Combat mechanics
function attackUnit(attacker, defender) {
    if (!isValidAttack(attacker, defender.x, defender.y)) {
        console.log("Attack failed: Target is out of range.");
        return;
    }
    defender.hp -= attacker.attackPower;
    console.log(`Attacked! Defender HP is now ${defender.hp}`);
    if (defender.hp <= 0) {
        removeUnit(defender);
    } else {
        // Update defender health bar
        const defenderTile = getTile(defender.x, defender.y);
        const healthBarInner = defenderTile.element.querySelector('.health-bar-inner');
        healthBarInner.style.width = `${(defender.hp / 20) * 100}%`;
    }
}

// Validate attack range
function isValidAttack(attacker, targetX, targetY) {
    const distance = Math.abs(attacker.x - targetX) + Math.abs(attacker.y - targetY);
    return distance <= attacker.attackRange;
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
    console.log(`Turn ended. Next turn: ${currentTurn}`);
}

// Initialize the game
document.body.insertAdjacentHTML('afterbegin', '<div id="turn-indicator">PLAYER\'s Turn</div>');
addBase(0, 0, 'player');
addBase(9, 9, 'enemy');
addUnit(1, 1, 'player', 'default'); // Default melee unit
addUnit(8, 8, 'enemy', 'archer');  // Archer unit with range 3