//////GLOBAL VARIABLES////////

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const snakeHeadImg = new Image();
snakeHeadImg.src = "images/snakehead.png";
const snakeBodyImg = new Image();
snakeBodyImg.src = "images/snakebody.png";
const pooImg = new Image();
pooImg.src = "images/poop.png";
const foodImg = new Image();
foodImg.src = "images/burger.png";
const poonoise = new Audio("sounds/fart.mp3");
//arrow keys for mobile
document.getElementById("left").addEventListener("touchstart", function() {
    event = new KeyboardEvent('keydown', {'key': 'ArrowLeft'});
    document.dispatchEvent(event);  
}); 
document.getElementById("right").addEventListener("touchstart", function() {
    event = new KeyboardEvent('keydown', {'key': 'ArrowRight'});
    document.dispatchEvent(event);
});         
document.getElementById("up").addEventListener("touchstart", function() {
    event = new KeyboardEvent('keydown', {'key': 'ArrowUp'});
    document.dispatchEvent(event);
}); 
document.getElementById("down").addEventListener("touchstart", function() {
    event = new KeyboardEvent('keydown', {'key': 'ArrowDown'});
    document.dispatchEvent(event);
});
const box = 20; // Snake and food size
const bigbox = 40; // Wall size
let poocontainer = []; // Array to hold poo positions
let poo = { x: -box, y: -box }; //start poo off screen
let snake = [{ x: 200, y: 200 }];
let wall = []; // Array to hold parts of the wall
let food = { x: getRandomPosition(), y: getRandomPosition() }; // Initial food position
let dx = box, dy = 0; // Initial movement direction
let score = 0;  // Initial score
let life = 3;   // Initial lives
let lastWallScore = 0; // Track the score when the last wall was added
let gameRunning = false; // Track if the game is running

///////OPEN SCREEN AND MENU////////


document.getElementById("howtoplay").style.display = 'none'; // Hide instructions initially
document.getElementById("back").style.display = 'none'; // Hide back button initially
document.getElementById("back").addEventListener("click", function() {
    document.getElementById("howtoplay").style.display = 'none'; // Hide instructions
    document.getElementById("howto").style.display = 'block'; // Show the howto button again
    this.style.display = 'none'; // Hide the back button after clicking
    document.getElementById("Start").style.display = 'block'; // Show the start button again
    document.getElementById("gameCanvas").style.display = 'block'; // Show the start button again
});

document.getElementById("howto").addEventListener("click", function() {
    document.getElementById("howtoplay").style.display = 'block'; // Show instructions
    document.getElementById("back").style.display = 'block'; // Show back button
    this.style.display = 'none'; // Hide the howto button after clicking
    document.getElementById("gameCanvas").style.display = 'none'; // Hide the start button after clicking
});

document.getElementById("Start").addEventListener("click", function() {
    this.style.display = 'none'; // Hide the button after clicking
    document.getElementById("howto").style.display = 'none'; // Hide the howto button after clicking
    document.getElementById("howtoplay").style.display = 'none'; // Hide the instructions after clicking
    startGame();
});   

/////FUNCTIONS//////

function startGame() {    // Start or restart the game
    resetGame();
    gameRunning = true;
}

function drawSnake() {  // Draw snake with head rotation
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
            ctx.drawImage(snakeBodyImg, segment.x, segment.y, box, box);
        }
    });
}

function generateLongWall(length = 4) {  // Generate a wall of given length
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
// Listen for arrow key / WASD presses
document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
    if (event.key === "ArrowUp" && dy === 0 || event.key === "w" && dy === 0) { dx = 0; dy = -box; }
    else if (event.key === "ArrowDown" && dy ===0 || event.key === "s" && dy === 0) { dx = 0; dy = box; }
    else if (event.key === "ArrowLeft" && dx === 0 || event.key === "a" && dx === 0) { dx = -box; dy = 0; }
    else if (event.key === "ArrowRight" && dx === 0 || event.key === "d" && dx === 0) { dx = box; dy = 0; }

}
// Reset the game state
function resetGame() {
    snake = [{ x: 200, y: 200 }];
    food = { x: getRandomPosition(), y: getRandomPosition() };
    wall = []; // Clear walls on reset
    speed = 100; // Reset speed on game reset
    updateSpeed(); // Apply the reset speed
    increaseSpeedIfNeeded = null; // Reset speed increase function
    poo = { x: -box, y: -box }; // Reset poo position off-screen
    life = 3; // Reset lives on game reset
    document.getElementById("gameCanvas").style.backgroundColor = "lightblue";
    document.getElementById("bullshit").textContent = "";
    document.getElementById("scorebox").textContent = `Score: 0`;
    score = 0;
    poocontainer = []; // Clear poo container
    dx = box;
    dy = 0;
    score = 0;
    gameRunning = true;
    lastWallScore = 0; // Reset last wall score
}
// Game loop
function updateGame() {
    if (!gameRunning) return; // Stop the game if it's over
    document.getElementById("lifecontainer").textContent = `Lives: ${life}`;
    
    // Move snake by adding new head
    let newHead = { x: snake[0].x + dx, y: snake[0].y + dy };
    //Delete and add walls
    if (score >= 20 && score % 5 === 0 && score !== lastWallScore) {
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
    if (score >= 20) {
        for (let segment of wall) {
            if (newHead.x === segment.x && newHead.y === segment.y) {
            gameOver();
            return;
        }
        if (newHead.x === wall.x && newHead.y === wall.y) {
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

    // Check for collision with poo
    if (score >= 10) {


        for (let segment of poocontainer) {

            if (newHead.x === segment.x && newHead.y === segment.y) {
                poonoise.play(); // Play sound effect
              life--;
              document.getElementById("lifecontainer").textContent = `Lives: ${life}`;
              // Remove the poo that was hit
              poocontainer = poocontainer.filter(p => p.x !== segment.x || p.y !== segment.y);
    
              if (life <= 0) {
                  gameOver();
              }
              return;
            }
        }
    }

   //check if food is eaten and score is 5 or more to spawn poo
    
    if (score >= 5 && newHead.x === food.x && newHead.y === food.y) {


        score++;
        document.getElementById("scorebox").textContent = `Score: ${score}`;
        food = { x: getRandomPosition(), y: getRandomPosition() };
        poo= { x: snake[snake.length - 1].x, y: snake[snake.length - 1].y }; //spawn poo at tail position
        //avoid spawning food on snake or walls or poo  
        while (snake.some(segment => segment.x === food.x && segment.y === food.y) ||
               wall.some(segment => segment.x === food.x && segment.y === food.y) ||
               poocontainer.some(p => p.x === food.x && p.y === food.y)) {
            food = { x: getRandomPosition(), y: getRandomPosition() };
        }
        poocontainer.push({x: poo.x, y: poo.y}); // Add poo position to container
        if (poocontainer.length > 3) { // Limit number of poos on screen 
            poocontainer.shift(); // Remove oldest poo
        }
        increaseSpeedIfNeeded && increaseSpeedIfNeeded();

    }
      
    else if (newHead.x === food.x && newHead.y === food.y) {
        score++;
        document.getElementById("scorebox").textContent = `Score: ${score}`;
         food = { x: getRandomPosition(), y: getRandomPosition() };
         //avoid spawning food on snake or walls
         while (snake.some(segment => segment.x === food.x && segment.y === food.y) ||
                wall.some(segment => segment.x === food.x && segment.y === food.y)) {
            food = { x: getRandomPosition(), y: getRandomPosition() };
        }
        increaseSpeedIfNeeded && increaseSpeedIfNeeded();
    } else {
        snake.pop(); // Remove tail if no food is eaten
    }

// Display messages at certain scores

    if (score === 5){

        document.getElementById("bullshit").textContent = "Getting faster!";
    }

        else if (score === 20){

            document.getElementById("bullshit").textContent = "Incoming walls!";
    }

        else if (score === 10){

            document.getElementById("bullshit").textContent = "Avoid your own poop!";
    }

    else if (score === 30){

            document.getElementById("bullshit").textContent = "Longer walls!";
    }

        else if (score === 50){ 
            document.getElementById("bullshit").textContent = "Jesus Christ!";
            document.getElementById("gameCanvas").style.backgroundColor = "gold";
    }

    snake.unshift(newHead); // Add new head

    drawGame();

}
// Handle game over
function gameOver() {

    gameRunning = false;
    document.getElementById("gameCanvas").style.display = "none"
    document.getElementById("gameOver").style.display = "block"
    }

document.getElementById("gameOver").addEventListener("click", function) {
    resetGame()
}

// Draw snake and food
function drawGame() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //draw poo container poos
    if (score >= 5) {
        poocontainer.forEach(poo => ctx.drawImage(pooImg, poo.x, poo.y, box, box));
    
    }
      
    //Draw walls
    if (score >= 10) {
        ctx.fillStyle = "orange" 
        wall.forEach(segment => ctx.fillRect(segment.x, segment.y, bigbox, bigbox));

    }
    // Draw food
    ctx.drawImage(foodImg, food.x, food.y, box, box);


    //Draw poo
    if (score >= 5)
    ctx.drawImage(pooImg, poo.x, poo.y, box, box);
    // Draw snake
    drawSnake();
}
// Dynamic game speed
let speed = 100;
let gameInterval = setInterval(updateGame, speed);

function updateSpeed() {


    clearInterval(gameInterval);


    gameInterval = setInterval(updateGame, speed);


}
// Increase speed based on score
function increaseSpeedIfNeeded() {
    if (score > 0 && score % 10 === 0) {
        // Decrease interval (increase speed), but don't go below a minimum
        speed = Math.max(30, speed - 10);
        updateSpeed();
    }
}

