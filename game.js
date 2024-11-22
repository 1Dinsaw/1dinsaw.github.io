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
  x: 100,
  y: 100,
  width: 30,
  height: 50,
  color: "lime",
  speed: 5,
  health: 100,
  xp: 0,
  isAttacking: false,
  weapon: "sword", // Default weapon
};

// Enemy properties
const enemies = [];
const enemySize = 30;

// Input tracking
const keys = {};

document.addEventListener("keydown", (event) => {
  keys[event.key] = true;

  // Attack mechanic
  if (event.key === " " && !dinsaw.isAttacking && waveInProgress) {
    dinsaw.isAttacking = true;
    attack();
    setTimeout(() => (dinsaw.isAttacking = false), 500); // Cooldown
  }
});

document.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

// Spawn a wave of enemies
function spawnWave(waveCount) {
  for (let i = 0; i < waveCount; i++) {
    enemies.push({
      x: Math.random() * (canvas.width - enemySize),
      y: Math.random() * (canvas.height - enemySize),
      width: enemySize,
      height: enemySize,
      color: "red",
      speed: 2 + Math.random() * 2,
      health: 20,
    });
  }
}

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
      let damage = 10; // Default sword damage
      if (dinsaw.weapon === "bow") damage = 7;
      if (dinsaw.weapon === "magic") damage = 5;

      enemy.health -= damage;

      if (enemy.health <= 0) {
        enemies.splice(index, 1); // Remove defeated enemy
        dinsaw.xp += 10; // Gain XP
      }
    }
  });

  if (dinsaw.weapon === "magic") {
    // Area-of-effect attack
    enemies.forEach((enemy) => {
      if (Math.hypot(enemy.x - dinsaw.x, enemy.y - dinsaw.y) < 50) {
        enemy.health -= 5;
        if (enemy.health <= 0) enemies.splice(enemies.indexOf(enemy), 1);
      }
    });
  }
}

// Draw arena with grid and decorations
function drawArena() {
  // Draw the grid
  ctx.fillStyle = "#1e1e1e"; // Grid background color
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gridSize = 40;
  ctx.strokeStyle = "#333"; // Gridline color
  ctx.lineWidth = 1;

  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Add some decorations
  ctx.fillStyle = "#444";
  ctx.fillRect(100, 100, 50, 50); // Example decoration: stone block
  ctx.fillStyle = "#888";
  ctx.beginPath();
  ctx.arc(700, 500, 30, 0, Math.PI * 2); // Example: random circle
  ctx.fill();

  // Add ground border
  ctx.strokeStyle = "#4caf50"; // Bright green border
  ctx.lineWidth = 5;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

// Show ability choices
function showAbilityChoices() {
  abilityChoiceShown = true;

  const choiceContainer = document.createElement("div");
  choiceContainer.id = "choice-container";
  choiceContainer.style.position = "absolute";
  choiceContainer.style.top = "50%";
  choiceContainer.style.left = "50%";
  choiceContainer.style.transform = "translate(-50%, -50%)";
  choiceContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  choiceContainer.style.color = "white";
  choiceContainer.style.padding = "20px";
  choiceContainer.style.textAlign = "center";

  choiceContainer.innerHTML = `
    <h2>Choose Your Reward</h2>
    <button id="heal">Heal (+20 Health)</button>
    <button id="speed">Speed Boost (Temporary)</button>
    <button id="new-weapon">Upgrade Weapon</button>
  `;

  document.body.appendChild(choiceContainer);

  document.getElementById("heal").onclick = () => {
    dinsaw.health = Math.min(dinsaw.health + 20, 100);
    startNextWave();
  };

  document.getElementById("speed").onclick = () => {
    dinsaw.speed += 2;
    setTimeout(() => (dinsaw.speed -= 2), 10000); // Speed boost lasts 10 seconds
    startNextWave();
  };

  document.getElementById("new-weapon").onclick = () => {
    dinsaw.weapon = prompt("Choose a weapon: sword, bow, magic") || "sword";
    startNextWave();
  };
}

// Start the next wave
function startNextWave() {
  abilityChoiceShown = false;
  document.getElementById("choice-container").remove();
  currentWave++;
  spawnWave(currentWave + 2); // More enemies with each wave
  waveInProgress = true;
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
    if (isColliding(enemy, dinsaw)) {
      dinsaw.health -= 1;
    }
  });

  // End of wave
  if (enemies.length === 0 && !abilityChoiceShown) {
    waveInProgress = false;
    showAbilityChoices();
  }
}

function draw() {
  // Draw arena first
  drawArena();

  // Draw player
  ctx.fillStyle = dinsaw.color;
  ctx.fillRect(dinsaw.x, dinsaw.y, dinsaw.width, dinsaw.height);

  // Draw enemies
  enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });

  // Update HUD
  document.getElementById("health").textContent = Math.max(dinsaw.health, 0);
  document.getElementById("xp").textContent = dinsaw.xp;
}

// Main game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update();
  draw();

  if (dinsaw.health > 0) {
    requestAnimationFrame(gameLoop);
  } else {
    alert("Game Over!");
  }
}

// Initialize game
spawnWave(3); // Initial wave
gameLoop();