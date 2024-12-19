const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

canvas.width = WIDTH;
canvas.height = HEIGHT;

const groundHeight = 50;
const playerWidth = 20;
const playerHeight = 100;
const attackSize = 20;
const gravity = 1.5;
const jumpStrength = 20;

let player = { x: 200, y: HEIGHT - groundHeight - playerHeight, dx: 0, dy: 0, hp: 3, attacking: false, direction: "right" };
let enemy = { x: WIDTH - 250, y: HEIGHT - groundHeight - playerHeight, dx: 0, dy: 0, hp: 3, attacking: false, direction: "left" };

let score = 0;
let keys = {};
let gameActive = false;

function startGame() {
    document.getElementById("title-screen").style.display = "none";
    canvas.style.display = "block";
    gameActive = true;
    gameLoop();
}

document.getElementById("play-button").addEventListener("click", startGame);

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function applyGravity(character) {
    if (character.y + playerHeight < HEIGHT - groundHeight) {
        character.dy += gravity;
    } else {
        character.dy = 0;
        character.y = HEIGHT - groundHeight - playerHeight;
    }
}

function moveCharacter(character) {
    character.x += character.dx;
    character.y += character.dy;
}

function attack(character) {
    const attackX = character.direction === "right" ? character.x + playerWidth : character.x - attackSize;
    const attackY = character.y + (character.attacking === "mid" ? playerHeight / 2 - attackSize / 2 : playerHeight - attackSize - 10);
    return { x: attackX, y: attackY, width: attackSize, height: attackSize };
}

function detectCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function enemyLogic() {
    enemy.attacking = Math.random() > 0.5 ? "mid" : "low";
    enemy.direction = player.x > enemy.x ? "right" : "left";
    enemy.dx = player.x > enemy.x ? 2 : -2;
    if (enemy.hp <= 0) {
        enemy.hp = 3;
        enemy.x = Math.random() * (WIDTH - 300) + 150;
        enemy.y = HEIGHT - groundHeight - playerHeight;
    }
}

function gameLoop() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    applyGravity(player);
    applyGravity(enemy);

    moveCharacter(player);
    moveCharacter(enemy);

    enemyLogic();

    const playerAttack = attack(player);
    const enemyAttack = attack(enemy);

    // Player attack hits enemy
    if (player.attacking && detectCollision(playerAttack, { x: enemy.x, y: enemy.y, width: playerWidth, height: playerHeight })) {
        enemy.hp -= 1;
        player.attacking = false;
        if (enemy.hp <= 0) {
            score += 10;
        }
    }

    // Enemy attack hits player
    if (enemy.attacking && detectCollision(enemyAttack, { x: player.x, y: player.y, width: playerWidth, height: playerHeight })) {
        enemy.attacking = false;
        player.hp -= 1;
        if (player.hp <= 0) {
            alert("Game Over! Final Score: " + score);
            location.reload();
        }
    }

    drawRect(player.x, player.y, playerWidth, playerHeight, "blue"); // Player
    drawRect(enemy.x, enemy.y, playerWidth, playerHeight, "red");   // Enemy

    // Draw attack squares
    if (player.attacking) drawRect(playerAttack.x, playerAttack.y, playerAttack.width, playerAttack.height, "cyan");
    if (enemy.attacking) drawRect(enemyAttack.x, enemyAttack.y, enemyAttack.width, enemyAttack.height, "pink");

    // Display score and HP
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);
    ctx.fillText("HP: " + player.hp, 20, 60);

    requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    // Jump
    if (e.key === "ArrowUp" && player.y === HEIGHT - groundHeight - playerHeight) {
        player.dy = -jumpStrength;
    }

    // Attack
    if (e.key === " ") {
        player.attacking = Math.random() > 0.5 ? "mid" : "low";
    }
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") player.dx = 0;
});

function controlPlayer() {
    if (keys["ArrowLeft"]) {
        player.dx = -5;
        player.direction = "left";
    }
    if (keys["ArrowRight"]) {
        player.dx = 5;
        player.direction = "right";
    }
}

setInterval(controlPlayer, 1000 / 60);
