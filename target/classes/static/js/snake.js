/* ================= STORAGE ================= */
let scoreHistory = JSON.parse(localStorage.getItem("snakeScoreHistory")) || [];
let highestScore = parseInt(localStorage.getItem("snakeHighestScore")) || 0;

/* ================= CANVAS ================= */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* ================= CONFIG ================= */
const box = 20; // grid size
let snake = [];
let food = {};
let score = 0;

let direction = "RIGHT";
let nextDirection = "RIGHT";

let isRunning = false;
let isGameOver = false;
let gameInterval = null;
let speed = 120; // milliseconds per move

/* ================= INIT ================= */
resetGameState();
updateScoreHistoryDisplay();

/* ================= KEYBOARD ================= */
document.addEventListener("keydown", e => {

    // Always allow restart
    if (e.key.toLowerCase() === "r") {
        restartGame();
        return;
    }

    if (isGameOver) return;

    // Pause/resume
    if (e.code === "Space") {
        isRunning ? pauseGame() : playGame();
        e.preventDefault();
        return;
    }

    // Change direction (grid-based)
    if (e.key === "ArrowUp" && direction !== "DOWN") nextDirection = "UP";
    if (e.key === "ArrowDown" && direction !== "UP") nextDirection = "DOWN";
    if (e.key === "ArrowLeft" && direction !== "RIGHT") nextDirection = "LEFT";
    if (e.key === "ArrowRight" && direction !== "LEFT") nextDirection = "RIGHT";
});

/* ================= GAME LOOP ================= */
function gameLoop() {
    moveSnake();
    drawGame();
}

/* ================= MOVE SNAKE ================= */
function moveSnake() {
    // Only change direction on grid alignment
    direction = nextDirection;

    const head = { ...snake[0] };

    switch (direction) {
        case "UP": head.y -= box; break;
        case "DOWN": head.y += box; break;
        case "LEFT": head.x -= box; break;
        case "RIGHT": head.x += box; break;
    }

    // Wall collision
    if (head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height) {
        return gameOver();
    }

    // Self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            return gameOver();
        }
    }

    // Move snake
    snake.unshift(head);

    // Eat food
    if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById("score").innerText = "Score: " + score;
        food = randomFood();
    } else {
        snake.pop(); // remove tail
    }
}

/* ================= DRAW ================= */
/* ================= DRAW ================= */
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake as rounded circles
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "#7CFF9B" : "#00C853";
        ctx.beginPath();
        ctx.arc(segment.x + box / 2, segment.y + box / 2, box / 2 - 1, 0, Math.PI * 2);
        ctx.fill();

        // Draw eyes on head
        if (index === 0) {
            ctx.fillStyle = "#000";
            ctx.beginPath();
            ctx.arc(segment.x + 5, segment.y + 7, 2, 0, Math.PI * 2);
            ctx.arc(segment.x + 15, segment.y + 7, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw food as a rounded circle
    ctx.fillStyle = "#FF1744";
    ctx.beginPath();
    ctx.arc(food.x + box / 2, food.y + box / 2, box / 2 - 3, 0, Math.PI * 2);
    ctx.fill();

    // Food stem
    ctx.strokeStyle = "#4E342E";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(food.x + box / 2, food.y + 4);
    ctx.lineTo(food.x + box / 2, food.y);
    ctx.stroke();
}

/* ================= FOOD ================= */
function randomFood() {
    let x, y, valid;
    const cols = Math.floor(canvas.width / box);
    const rows = Math.floor(canvas.height / box);

    do {
        valid = true;
        x = Math.floor(Math.random() * cols) * box;
        y = Math.floor(Math.random() * rows) * box;

        // Ensure food does not spawn on snake
        for (let s of snake) {
            if (s.x === x && s.y === y) {
                valid = false;
                break;
            }
        }
    } while (!valid);

    return { x, y };
}

/* ================= CONTROLS ================= */
function playGame() {
    if (isRunning) return;
    isRunning = true;
    gameInterval = setInterval(gameLoop, speed);
}

function pauseGame() {
    isRunning = false;
    clearInterval(gameInterval);
}

function restartGame() {
    pauseGame();
    resetGameState();
    playGame();
}

/* ================= GAME OVER ================= */
function gameOver() {
    pauseGame();
    isGameOver = true;

    if (score > 0) {
        scoreHistory.push(score);
        localStorage.setItem("snakeScoreHistory", JSON.stringify(scoreHistory));

        if (score > highestScore) {
            highestScore = score;
            localStorage.setItem("snakeHighestScore", highestScore);
        }

        updateScoreHistoryDisplay();
    }

    document.getElementById("finalScore").innerText = "Score: " + score;
    document.getElementById("gameOverModal").style.display = "flex";
}

/* ================= UI ================= */
function updateScoreHistoryDisplay() {
    const list = document.getElementById("scoreHistory");
    list.innerHTML = "";

    scoreHistory.forEach((s, i) => {
        const li = document.createElement("li");
        li.textContent = `Game ${i + 1}: ${s}`;
        list.appendChild(li);
    });

    document.getElementById("highestScore").innerText = `Highest Score: ${highestScore}`;
}

/* ================= RESET ================= */
function resetGameState() {
    snake = [{ x: 200, y: 200 }];
    direction = "RIGHT";
    nextDirection = "RIGHT";

    score = 0;
    isGameOver = false;
    isRunning = false;

    document.getElementById("score").innerText = "Score: 0";
    document.getElementById("gameOverModal").style.display = "none";

    food = randomFood();

    if (gameInterval) clearInterval(gameInterval);
}

/* ================= DIFFICULTY ================= */
function changeMode(mode) {
    if (mode === "easy") speed = 180;
    if (mode === "normal") speed = 120;
    if (mode === "hard") speed = 70;

    if (isRunning) {
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, speed);
    }
}
