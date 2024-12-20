const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const backgroundImage = new Image();
backgroundImage.src = "pexels-thatguycraig000-1563356.jpg";

// Resize canvas to fit the screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameSettings.groundHeight = canvas.height * 0.1;
    if (!gameActive) repositionCharacters();
}


function repositionCharacters() {
    player.x = canvas.width * 0.2;
    player.y = canvas.height - gameSettings.groundHeight - player.height;
    enemy.x = canvas.width * 0.8;
    enemy.y = canvas.height - gameSettings.groundHeight - enemy.height;
}

// Game settings
const gameSettings = {
    groundHeight: 50,
    gravity: 1.5,
    jumpStrength: 20,
    enemyAttackCooldown: 1000, // in milliseconds
    bounceDistance: 10,
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

// Start game
function startGame() {
    document.getElementById("title-screen").style.display = "none";
    canvas.style.display = "block";
    gameActive = true;
    repositionCharacters();
    gameLoop();
}

document.getElementById("play-button").addEventListener("click", startGame);

// Helper functions
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
    character.y += character.dy; // Apply the gravity effect
}


function moveCharacter(character) {
    character.x += character.dx;
    character.y += character.dy;
}

function attack(character) {
    const attackSize = 20;
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

function bounceBack(character1, character2) {
    if (character1.x < character2.x) {
        character1.x = Math.max(0, character1.x - gameSettings.bounceDistance);
        character2.x = Math.min(canvas.width - character2.width, character2.x + gameSettings.bounceDistance);
    } else {
        character1.x = Math.min(canvas.width - character1.width, character1.x + gameSettings.bounceDistance);
        character2.x = Math.max(0, character2.x - gameSettings.bounceDistance);
    }
}


function handleCollision(character1, character2) {
    if (
        detectCollision(
            { x: character1.x, y: character1.y, width: character1.width, height: character1.height },
            { x: character2.x, y: character2.y, width: character2.width, height: character2.height }
        )
    ) {
        bounceBack(character1, character2);
        character1.dx = 0;
        character2.dx = 0;
    }
}

function enemyLogic() {
    const currentTime = Date.now();

    if (!enemy.attacking && currentTime - enemy.lastAttackTime > gameSettings.enemyAttackCooldown) {
        enemy.attacking = true;
        enemy.lastAttackTime = currentTime;

        setTimeout(() => (enemy.attacking = false), 500); // 500ms attack duration
    }

    if (player.x > enemy.x) {
        enemy.dx = 2;
        enemy.direction = "right";
    } else if (player.x < enemy.x) {
        enemy.dx = -2;
        enemy.direction = "left";
    } else {
        enemy.dx = 0;
    }
}


function gameLoop() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    applyGravity(player);
    applyGravity(enemy);

    moveCharacter(player);
    moveCharacter(enemy);

    enemyLogic();
    handleCollision(player, enemy);

    const playerAttack = attack(player);
    const enemyAttack = attack(enemy);

    // Player attacks enemy
    if (player.attacking && detectCollision(playerAttack, enemy)) {
        enemy.hp -= 1;
        player.attacking = false;
        if (enemy.hp <= 0) {
            score += 10;
            enemy.hp = 3;
            repositionCharacters();
        }
    }

    // Enemy attacks player
    if (enemy.attacking && detectCollision(enemyAttack, player)) {
        enemy.attacking = false;
        player.hp -= 1;
        if (player.hp <= 0) {
            alert("Game Over! Final Score: " + score);
            location.reload();
        }
    }

    // Draw characters
    drawRect(player.x, player.y, player.width, player.height, "blue");
    drawRect(enemy.x, enemy.y, enemy.width, enemy.height, "red");

    // Draw attacks
    if (player.attacking) drawRect(playerAttack.x, playerAttack.y, playerAttack.width, playerAttack.height, "cyan");
    if (enemy.attacking) drawRect(enemyAttack.x, enemyAttack.y, enemyAttack.width, enemyAttack.height, "pink");

    // Display score and health
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Player HP: ${player.hp}`, 20, 60);
    ctx.fillText(`Enemy HP: ${enemy.hp}`, 20, 90);

    requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    if (e.key === "ArrowUp" && player.dy === 0) {
        player.dy = -gameSettings.jumpStrength;
    }

    if (e.key === " " && !player.attacking) {
        player.attacking = Math.random() > 0.5 ? "mid" : "low";
        setTimeout(() => (player.attacking = false), 500); // Example: 500ms cooldown
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
    } else if (keys["ArrowRight"]) {
        player.dx = 5;
        player.direction = "right";
    } else {
        player.dx = 0;
    }
}

function gameLoop() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    controlPlayer(); // Add player control here
    drawBackground();
    applyGravity(player);
    applyGravity(enemy);

    moveCharacter(player);
    moveCharacter(enemy);

    enemyLogic();
    handleCollision(player, enemy);

    const playerAttack = attack(player);
    const enemyAttack = attack(enemy);

    // (Other logic for attacks and rendering remains the same)
    requestAnimationFrame(gameLoop);
}


setInterval(controlPlayer, 1000 / 60);
window.addEventListener("resize", resizeCanvas);

// Initialize game
resizeCanvas();
