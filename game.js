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
};

// Input tracking
const keys = {};

document.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

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
}

function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw character
  ctx.fillStyle = dinsaw.color;
  ctx.fillRect(dinsaw.x, dinsaw.y, dinsaw.width, dinsaw.height);

  // Update HUD
  document.getElementById("health").textContent = dinsaw.health;
  document.getElementById("xp").textContent = dinsaw.xp;
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
