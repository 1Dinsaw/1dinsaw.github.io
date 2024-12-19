const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const backgroundImage = new Image();
backgroundImage.src = "pexels-thatguycraig000-1563356.jpg";

// Dynamic canvas resizing
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameSettings.groundHeight = canvas.height * 0.1;
    repositionCharacters();
}

function repositionCharacters() {
    player.x = canvas.width * 0.2;
    player.y = canvas.height - gameSettings.groundHeight - player.height;
    enemy.x = canvas.width * 0.8;
    enemy.y = canvas.height - gameSettings.groundHeight - enemy.height;
}

// Game constants
const gameSettings = {
    groundHeight: 50,
    gravity: 1.5,
    jumpStrength: 20,
    enemyAttackCooldown: 1000, // in milliseconds
};

const player = {
    width: 20,
    height: 100,
    x: 200,
    y: 0,
    dx: 0,
    dy: 0,
    hp: 3,
    attacking: false,
    direction: "right",
};

const enemy = {
    width: 20,
    height: 100,
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    hp: 3,
    attacking: false,
    direction: "left",
    lastAttackTime: 0,
};

let score = 0;
let keys = {};
let gameActive = false;

function startGame() {
    document.getElementById("title-screen").style.display = "none";
    canvas.style.display = "block";
    gameActive = true;
    repositionCharacters();
    gameLoop();
}

document.getElementById("play-button").addEventListener("click", startGame);

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function applyGravity(character) {
    if (character.y + character.height < canvas.height - gameSettings.groundHeight) {
        character.dy += gameSettings.gravity;
    } else {
        character.dy = 0;
        character.y = canvas.height - gameSettings.groundHeight - character.height;
    }
}

function moveCharacter(character) {
    character.x += character.dx;
    character.y += character.dy;
}

function attack(character) {
    const attackX = character.direction === "right" ? character.x + character.width : character.x - attackSize;
    const attackY =
        character.y + (character.attacking === "mid" ? character.height / 2 - attackSize / 2 : character.height - attackSize - 10);
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

function bounceBack(attacker, victim) {
    const bounceDistance = 20;
    if (attacker.direction === "right") {
        attacker.x -= bounceDistance;
        victim.x += bounceDistance;
    } else {
        attacker.x += bounceDistance;
        victim.x -= bounceDistance;
    }
}

function enemyLogic() {
    const currentTime = Date.now();

    // Handle enemy attack cooldown
    if (currentTime - enemy.lastAttackTime > gameSettings.enemyAttackCooldown) {
        enemy.attacking = Math.random() > 0.5 ? "mid" : "low";
        enemy.lastAttackTime = currentTime;
    }

    // Ensure the enemy acts as a "rock" and blocks movement
    const overlap = detectCollision(
        { x: player.x, y: player.y, width: player.width, height: player.height },
        { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height }
    );

    if (overlap) {
        bounceBack(player, enemy);
    }
}

function gameLoop() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the background first
    drawBackground();

    // Apply gravity and movement logic
    applyGravity(player);
    applyGravity(enemy);

    moveCharacter(player);
    moveCharacter(enemy);

    // Handle enemy logic and collision
    enemyLogic();

    // Handle collisions between player and enemy
    handleCollision(player, enemy);

    // Calculate attack areas
    const playerAttack = attack(player);
    const enemyAttack = attack(enemy);

    // Check if player's attack hits the enemy
    if (player.attacking && detectCollision(playerAttack, { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height })) {
        enemy.hp -= 1;
        player.attacking = false;
        if (enemy.hp <= 0) {
            score += 10;
            enemy.hp = 3;
            enemy.x = Math.random() * (canvas.width - 300) + 150;
            enemy.y = canvas.height - gameSettings.groundHeight - enemy.height;
        }
    }

    // Check if enemy's attack hits the player
    if (enemy.attacking && detectCollision(enemyAttack, { x: player.x, y: player.y, width: player.width, height: player.height })) {
        enemy.attacking = false;
        player.hp -= 1;
        if (player.hp <= 0) {
            alert("Game Over! Final Score: " + score);
            location.reload();
        }
    }

    // Draw the player and enemy
    drawRect(player.x, player.y, player.width, player.height, "blue");
    drawRect(enemy.x, enemy.y, enemy.width, enemy.height, "red");

    // Draw attack squares
    if (player.attacking) drawRect(playerAttack.x, playerAttack.y, playerAttack.width, playerAttack.height, "cyan");
    if (enemy.attacking) drawRect(enemyAttack.x, enemyAttack.y, enemyAttack.width, enemyAttack.height, "pink");

    // Display score and health
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Player HP: ${player.hp}`, 20, 60);
    ctx.fillText(`Enemy HP: ${enemy.hp}`, 20, 90);

    // Continue the game loop
    requestAnimationFrame(gameLoop);
}


    // Player attack hits enemy
    if (player.attacking && detectCollision(playerAttack, { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height })) {
        enemy.hp -= 1;
        player.attacking = false;
        if (enemy.hp <= 0) {
            score += 10;
            enemy.hp = 3;
            enemy.x = Math.random() * (canvas.width - 300) + 150;
            enemy.y = canvas.height - gameSettings.groundHeight - enemy.height;
        }
    }

    // Enemy attack hits player
    if (enemy.attacking && detectCollision(enemyAttack, { x: player.x, y: player.y, width: player.width, height: player.height })) {
        enemy.attacking = false;
        player.hp -= 1;
        bounceBack(enemy, player);
        if (player.hp <= 0) {
            alert("Game Over! Final Score: " + score);
            location.reload();
        }
    }

    drawRect(player.x, player.y, player.width, player.height, "blue"); // Player
    drawRect(enemy.x, enemy.y, enemy.width, enemy.height, "red");   // Enemy

    // Draw attack squares
    if (player.attacking) drawRect(playerAttack.x, playerAttack.y, playerAttack.width, playerAttack.height, "cyan");
    if (enemy.attacking) drawRect(enemyAttack.x, enemyAttack.y, enemyAttack.width, enemyAttack.height, "pink");

    // Display score and HP
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Player HP: ${player.hp}`, 20, 60);
    ctx.fillText(`Enemy HP: ${enemy.hp}`, 20, 90);

    requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    // Jump
    if (e.key === "ArrowUp" && player.y === canvas.height - gameSettings.groundHeight - player.height) {
        player.dy = -gameSettings.jumpStrength;
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
window.addEventListener("resize", resizeCanvas);

// Initialize canvas size
resizeCanvas();
