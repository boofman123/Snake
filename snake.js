const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20; // Snake and food size
let snake = [{ x: 200, y: 200 }];
let food = { x: getRandomPosition(), y: getRandomPosition() };
let dx = box, dy = 0;
let score = 0;
let gameRunning = true; // Track if the game is running

// Generate random position for food
function getRandomPosition() {
    return Math.floor(Math.random() * (canvas.width / box)) * box;
}

// Listen for arrow key input
document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
    if (event.key === "ArrowUp" && dy === 0) { dx = 0; dy = -box; }
    else if (event.key === "ArrowDown" && dy === 0) { dx = 0; dy = box; }
    else if (event.key === "ArrowLeft" && dx === 0) { dx = -box; dy = 0; }
    else if (event.key === "ArrowRight" && dx === 0) { dx = box; dy = 0; }
}

// Reset the game state
function resetGame() {
    snake = [{ x: 200, y: 200 }];
    food = { x: getRandomPosition(), y: getRandomPosition() };
    dx = box;
    dy = 0;
    score = 0;
    gameRunning = true;
}

// Game loop
function updateGame() {
    if (!gameRunning) return; // Stop the game if it's over

    // Move snake by adding new head
    let newHead = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check for wall collision
    if (newHead.x < 0 || newHead.x >= canvas.width || newHead.y < 0 || newHead.y >= canvas.height) {
        gameOver();
        return;
    }

    // Check for self-collision
    for (let segment of snake) {
        if (newHead.x === segment.x && newHead.y === segment.y) {
            gameOver();
            return;
        }
    }

    // Check if food is eaten
    if (newHead.x === food.x && newHead.y === food.y) {
        score++;
        document.getElementById("scorebox").textContent = `Score: ${score}`;
        food = { x: getRandomPosition(), y: getRandomPosition() };
        increaseSpeedIfNeeded && increaseSpeedIfNeeded();
    } else {
        snake.pop(); // Remove tail if no food is eaten
    }

    snake.unshift(newHead); // Add new head

    drawGame();
}

// Handle game over
function gameOver() {
    gameRunning = false;
    alert(`Game Over! Score: ${score}`);
    if (confirm("Play again?")) {
        resetGame();
    }
}

// Draw snake and food
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw food
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // Draw snake
    if (score >= 5) {
        ctx.fillStyle = "purple"; // Change color if score >= 10
        snake.forEach(segment => ctx.fillRect(segment.x, segment.y, box, box));
    } else {
    ctx.fillStyle = "green";
    snake.forEach(segment => ctx.fillRect(segment.x, segment.y, box, box));

    }
}

// Dynamic game speed
let speed = 100;
let gameInterval = setInterval(updateGame, speed);

function updateSpeed() {
    clearInterval(gameInterval);
    gameInterval = setInterval(updateGame, speed);
}

function increaseSpeedIfNeeded() {
    if (score > 0 && score % 5 === 0) {
        // Decrease interval (increase speed), but don't go below a minimum
        speed = Math.max(30, speed - 10);
        updateSpeed();
    }
}