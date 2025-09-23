const canvas = document.getElementById("gameCanvas");

const ctx = canvas.getContext("2d");


const snakeHeadImg = new Image();
snakeHeadImg.src = "/home/lee-mcveagh/Desktop/Repos/Snake/images/snakehead.png";
const snakeBodyImg = new Image();
snakeBodyImg.src = "/home/lee-mcveagh/Desktop/Repos/Snake/images/snakebody.png";




const box = 20; // Snake and food size

const bigbox = 40; // Wall size

let snake = [{ x: 200, y: 200 }];

let wall = []; // Array to hold parts of the wall

let food = { x: getRandomPosition(), y: getRandomPosition() };

let dx = box, dy = 0;

let score = 0;

let gameRunning = true; // Track if the game is running


// Make longer walls

function drawSnake() {
    snake.forEach((segment, idx) => {
        if (idx === 0) {
            // Draw head with rotation
            ctx.save();
            // Move origin to center of head
            ctx.translate(segment.x + box / 2, segment.y + box / 2);

            // Determine rotation angle based on direction
            let angle = 0;
            if (dx === box && dy === 0) angle = 0; // Right
            else if (dx === -box && dy === 0) angle = Math.PI; // Left
            else if (dx === 0 && dy === -box) angle = -Math.PI / 2; // Up
            else if (dx === 0 && dy === box) angle = Math.PI / 2; // Down

            ctx.rotate(angle);
            // Draw image centered
            ctx.drawImage(snakeHeadImg, -box / 2, -box / 2, box, box);
            ctx.restore();
        } else {
            // Draw body (no rotation, or add logic for curved body if you have images)
            ctx.drawImage(snakeBodyImg, segment.x, segment.y, box, box);
        }
    });
}
function generateLongWall(length = 4) {
    let wallSegments;
    let tries = 0;
    do {
        const direction = Math.random() < 0.5;
        let startX = getWallposition();
        let startY = getWallposition();
        wallSegments = [];
        for (let i = 0; i < length; i++) {
            wallSegments.push({
                x: direction ? startX + i * bigbox : startX,
                y: direction ? startY : startY + i * bigbox
            });
        }
        tries++;
        // Limit attempts to avoid infinite loops
        if (tries > 100) break;
    } while (
        // Check overlap with snake
        wallSegments.some(seg => snake.some(s => s.x === seg.x && s.y === seg.y)) ||
        // Check overlap with food
        wallSegments.some(seg => food.x === seg.x && food.y === seg.y)
    );
    return wallSegments;
}
// Generate random position for food

function getRandomPosition() {

    return Math.floor(Math.random() * (canvas.width / box)) * box;

}

// Generate random position for walls

function getWallposition() {

    return Math.floor(Math.random() * (canvas.width / bigbox)) * bigbox;
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

let lastWallScore = 0; // Track the score when the last wall was added

// Game loop

function updateGame() {

    if (!gameRunning) return; // Stop the game if it's over



    // Move snake by adding new head

    let newHead = { x: snake[0].x + dx, y: snake[0].y + dy };

    //Delete and add walls

    if (score >= 10 && score % 5 === 0 && score !== lastWallScore) {
        wall = generateLongWall(4);
        lastWallScore = score; // Update the last wall score
    }
    else if (score >= 30 && score % 5 === 0 && score !== lastWallScore) {
        wall = generateLongWall(6); // Longer walls at higher scores
        lastWallScore = score;
    }




    // Check for wall collision

    if (newHead.x < 0 || newHead.x >= canvas.width || newHead.y < 0 || newHead.y >= canvas.height) {

        gameOver();

        return;

    }

    // Check for collision with walls
    if (score >= 10) {
    
        for (let segment of wall) {
        
            if (newHead.x === segment.x && newHead.y === segment.y) {
            gameOver();
            return;
        }
    }
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


    //Draw walls

    if (score >= 10) {

        ctx.fillStyle = "orange" 
        wall.forEach(segment => ctx.fillRect(segment.x, segment.y, bigbox, bigbox));
    }



    // Draw food

    ctx.fillStyle = "red";

    ctx.fillRect(food.x, food.y, box, box);



    // Draw snake

    drawSnake();

    

}




// Run game loop every 100ms




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