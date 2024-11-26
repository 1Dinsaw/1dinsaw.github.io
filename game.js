const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let ballSpeed = 4;
const ball = { x: canvas.width / 2, y: canvas.height - 50, radius: 10, dx: 0, dy: -ballSpeed };
let obstacles = [];
let gameOver = false;
let gameOverSoundPlayed = false;
let score = 0;
let highScores = JSON.parse(localStorage.getItem("highScores")) || [];

const backgroundMusic = new Audio("music-no-copyright-239544.mp3");
const bounceSound = new Audio("boing-2-44164.mp3");
const gameOverSound = new Audio("kl-peach-game-over-ii-135684.mp3");

backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

let gameStarted = false;

// Elements
const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const scoresList = document.getElementById("scoresList");
const backToTitleButton = document.getElementById("backToTitleButton");
const startButton = document.getElementById("startButton");

// Event Listeners
startButton.addEventListener("click", startGame);
backToTitleButton.addEventListener("click", returnToTitleScreen);

// Initialize High Scores Display
function displayHighScores() {
    scoresList.innerHTML = highScores
        .map((score, index) => `<li>${index + 1}. ${score}</li>`)
        .join("");
}

function returnToTitleScreen() {
    // Save score if game ended
    if (gameOver) {
        highScores.push(score);
        highScores.sort((a, b) => b - a); // Sort scores descending
        highScores = highScores.slice(0, 5); // Keep top 5 scores
        localStorage.setItem("highScores", JSON.stringify(highScores));
    }

    gameOver = false;
    resetGame();

    titleScreen.style.display = "flex";
    gameScreen.style.display = "none";

    displayHighScores();
}

function startGame() {
    titleScreen.style.display = "none";
    gameScreen.style.display = "flex";

    if (!gameStarted) {
        backgroundMusic.play().catch(e => console.error(e));
        gameStarted = true;
        initMap();
        gameLoop();
    }
}

function resetGame() {
    gameOver = false;
    gameOverSoundPlayed = false;
    score = 0;
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 50;
    ball.dx = 0;
    ball.dy = -ballSpeed;
    obstacles = [];

    // Stop all sounds
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    bounceSound.pause();
    bounceSound.currentTime = 0;
    gameOverSound.pause();
    gameOverSound.currentTime = 0;

    backToTitleButton.style.display = "none";
}

function randomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
}

function generateObstacle() {
    const width = Math.random() * (200 - 50) + 50;
    const height = 20;
    const x = Math.random() * (canvas.width - width);
    const color = randomColor();
    return { x, y: -height, width, height, color };
}

function initMap() {
    obstacles = [];
    for (let i = 0; i < 6; i++) {
        obstacles.push({ ...generateObstacle(), y: i * -150 });
    }
}

function checkCollision(ball, rect) {
    return (
        ball.y - ball.radius <= rect.y + rect.height &&
        ball.y + ball.radius >= rect.y &&
        ball.x + ball.radius >= rect.x &&
        ball.x - ball.radius <= rect.x + rect.width
    );
}

function gameLoop() {
    if (gameOver) {
        if (!gameOverSoundPlayed) {
            gameOverSound.play().catch(e => console.error(e));
            gameOverSoundPlayed = true;
        }
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over! Returning to Title Screen...", 150, canvas.height / 2);
        backToTitleButton.style.display = "inline";
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the ball
    ctx.fillStyle = "lime";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    // Update ball position
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.dx = -ball.dx;
        bounceSound.play().catch(e => console.error(e));
    }

    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        bounceSound.play().catch(e => console.error(e));
    }

    // Draw obstacles
    obstacles.forEach((obstacle, index) => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        obstacle.y += ballSpeed;

        if (checkCollision(ball, obstacle)) {
            gameOver = true;
        }

        if (obstacle.y > canvas.height) {
            obstacles[index] = generateObstacle();
        }
    });

    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("Score: " + score, 20, 30);

    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
    if (gameStarted) {
        if (e.key === "ArrowLeft" || e.key === "a") {
            ball.dx = -ballSpeed / 2;
        }
        if (e.key === "ArrowRight" || e.key === "d") {
            ball.dx = ballSpeed / 2;
        }
        if (e.key === "ArrowUp") {
            ballSpeed = Math.min(ballSpeed + 0.5, 10);
            ball.dy = -ballSpeed;
        }
        if (e.key === "ArrowDown") {
            ballSpeed = Math.max(ballSpeed - 0.5, 2);
            ball.dy = -ballSpeed;
        }
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "ArrowRight" || e.key === "d") {
        ball.dx = 0;
    }
});

setInterval(() => {
    if (!gameOver) {
        score++;
    }
}, 1000);

// Initialize the title screen
displayHighScores();
titleScreen.style.display = "flex";