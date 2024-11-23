const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game state
let currentWave = 1;
let waveInProgress = true;
let abilityChoiceShown = false;

// Character properties
const dinsaw = {
  x: 100, // Starting X position
  y: 100, // Starting Y position
  width: 30, // Player width
  height: 50, // Player height
  color: "lime", // Color for visibility
  speed: 10, // Player speed
  health: 100, // Player health
  xp: 0, // Player XP
  isAttacking: false,
  weapon: "sword", // Default weapon
};

// Available weapons
const weapons = ["sword", "bow", "magic"];
let currentWeaponIndex = weapons.indexOf(dinsaw.weapon); // Initialize starting weapon index

// Enemy properties
const enemies = [];
const enemySize = 30;

// Input tracking
const keys = {};

document.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

// Update player's position based on key states
function update() {
  if (keys["ArrowUp"]) dinsaw.y -= dinsaw.speed;
  if (keys["ArrowDown"]) dinsaw.y += dinsaw.speed;
  if (keys["ArrowLeft"]) dinsaw.x -= dinsaw.speed;
  if (keys["ArrowRight"]) dinsaw.x += dinsaw.speed;

  // Restrict movement within canvas boundaries
  dinsaw.x = Math.max(0, Math.min(canvas.width - dinsaw.width, dinsaw.x));
  dinsaw.y = Math.max(0, Math.min(canvas.height - dinsaw.height, dinsaw.y));

  // Update enemies' positions
  enemies.forEach((enemy) => {
    const dx = dinsaw.x - enemy.x;
    const dy = dinsaw.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      enemy.x += (dx / dist) * enemy.speed;
      enemy.y += (dy / dist) * enemy.speed;
    }

    if (isColliding(enemy, dinsaw)) {
      dinsaw.health -= 0.5; // Reduce health if collision with enemy
    }
  });

  if (enemies.length === 0 && !abilityChoiceShown) {
    waveInProgress = false;
    showAbilityChoices();
  }
}

// Draw the equipped weapon
function drawWeapon() {
  const weaponOffset = { x: dinsaw.width / 2, y: dinsaw.height / 2 };

  ctx.save();
  ctx.translate(dinsaw.x + weaponOffset.x, dinsaw.y + weaponOffset.y);

  if (dinsaw.weapon === "sword") {
    ctx.fillStyle = "gray";
    ctx.fillRect(-5, -20, 10, 40); // Sword blade
    ctx.fillStyle = "brown";
    ctx.fillRect(-10, 15, 20, 5); // Sword hilt
  } else if (dinsaw.weapon === "bow") {
    ctx.strokeStyle = "brown";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 20, Math.PI / 4, (3 * Math.PI) / 4); // Bow arc
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-15, -15);
    ctx.lineTo(15, 15); // Bow string
    ctx.stroke();
  } else if (dinsaw.weapon === "magic") {
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2); // Magic orb
    ctx.fill();
  }

  ctx.restore();
}

// Function to draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

  // Draw player
  ctx.fillStyle = dinsaw.color;
  ctx.fillRect(dinsaw.x, dinsaw.y, dinsaw.width, dinsaw.height);

  // Draw equipped weapon
  drawWeapon();

  // Draw enemies
  enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });

  document.getElementById("health").textContent = Math.max(dinsaw.health, 0);
  document.getElementById("xp").textContent = dinsaw.xp;
  document.getElementById("wave").textContent = `Wave: ${currentWave}`;
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop(); // Start the game loop