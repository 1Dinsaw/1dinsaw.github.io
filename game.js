// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Character properties
const dinsaw = {
  x: 100,
  y: 100,
  width: 30,
  height: 50,
  color: "lime",
  speed: 5,
  health: 100,
  xp: 0,
  isAttacking: false,
};

// Enemy properties
const enemies = [];
const enemySize = 30;

// Input tracking
const keys = {};

document.addEventListener("keydown", (event) => {
  keys[event.key] = true;

  // Attack mechanic
  if (event.key === " " && !dinsaw.isAttacking) {
    dinsaw.isAttacking = true;
    attack();
    setTimeout(() => (dinsaw.isAttacking = false), 500); // Cooldown
  }
});

document.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

// Spawn random enemies
function spawnEnemies(count) {
  for (let i = 0; i < count; i++) {
    enemies.push({
      x: Math.random() * (canvas.width - enemySize),
      y: Math.random() * (canvas.height - enemySize),
      width: enemySize,
      height: enemySize,
      color: "red",
      speed: 2,
      health: 20,
    });
  }
}

spawnEnemies(5);

// Check collision between two objects
function isColliding(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

// Attack mechanic
function attack() {
  enemies.forEach((enemy, index) => {
    if (isColliding(dinsaw, enemy)) {
      enemy.health -= 10;
      if (enemy.health <= 0) {
        enemies.splice(index, 1); // Remove defeated enemy
        dinsaw.xp += 10; // Gain XP
      }
    }
  });
}

// Game Loop
function update() {
  // Movement logic
  if (keys["ArrowUp"]) dinsaw.y -= dinsaw.speed;
  if (keys["ArrowDown"]) dinsaw.y += dinsaw.speed;
  if (keys["ArrowLeft"]) dinsaw.x -= dinsaw.speed;
  if (keys["ArrowRight"]) dinsaw.x += dinsaw.speed;

  // Boundaries
  dinsaw.x = Math.max(0, Math.min(canvas.width - dinsaw.width, dinsaw.x));
  dinsaw.y = Math.max(0, Math.min(canvas.height - dinsaw.height, dinsaw.y));

  // Enemy movement
  enemies.forEach((enemy) => {
    const dx = dinsaw.x - enemy.x;
    const dy = dinsaw.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      enemy.x += (dx / dist) * enemy.speed;
      enemy.y += (dy / dist) * enemy.speed;
    }

    // Check if enemy collides with the player
    if (isColliding(dinsaw, enemy)) {
      dinsaw.health -= 1; // Player takes damage
    }
  });
}

function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = dinsaw.color;
  ctx.fillRect(dinsaw.x, dinsaw.y, dinsaw.width, dinsaw.height);

  // Draw enemies
  enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });

  // Update HUD
  document.getElementById("health").textContent = dinsaw.health;
  document.getElementById("xp").textContent = dinsaw.xp;
}

function gameLoop() {
  update();
  draw();
  if (dinsaw.health > 0) {
    requestAnimationFrame(gameLoop);
  } else {
    alert("Game Over! Refresh to try again.");
  }
}

gameLoop();
