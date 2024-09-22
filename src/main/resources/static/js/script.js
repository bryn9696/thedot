const gameArea = document.getElementById('gameArea');
const DOT_SIZE = 20; // Size of the dot
const TIMER_INTERVAL = 1000 / 60; // 60 FPS for smooth movement

let dot = document.createElement('div');
dot.classList.add('dot');
gameArea.appendChild(dot);

// Message display element
const messageDisplay = document.getElementById('messageDisplay');

// Dot movement variables
let posX = Math.random() * (gameArea.clientWidth - DOT_SIZE);
let posY = Math.random() * (gameArea.clientHeight - DOT_SIZE);
let velocityX = 2; // Change to adjust speed
let velocityY = 2; // Change to adjust speed

// Game state variables
let clickCount = 0;
const MAX_CLICKS = 5; // Maximum allowed clicks
let gameOver = false;

// Initialize the dot's position
function initializeDot() {
    dot.style.left = `${posX}px`;
    dot.style.top = `${posY}px`;
}

// Move the dot
function moveDot() {
    if (gameOver) return; // Stop moving if the game is over

    posX += velocityX;
    posY += velocityY;

    // Check for boundary collisions
    if (posX <= 0 || posX >= gameArea.clientWidth - DOT_SIZE) {
        velocityX *= -1; // Reverse horizontal direction
    }
    if (posY <= 0 || posY >= gameArea.clientHeight - DOT_SIZE) {
        velocityY *= -1; // Reverse vertical direction
    }

    // Update dot position
    dot.style.left = `${posX}px`;
    dot.style.top = `${posY}px`;
}

// Handle mouse click in game area
function handleGameClick(mouseX, mouseY) {
    clickCount++;

    // Check if the click is inside the dot
    const isHit = mouseX >= posX && mouseX <= posX + DOT_SIZE && mouseY >= posY && mouseY <= posY + DOT_SIZE;

    if (isHit) {
        // Successfully clicked the dot
        messageDisplay.textContent = "You win!";
        gameOver = true; // End the game
    } else if (clickCount >= MAX_CLICKS) {
        // Reached maximum clicks without hitting the dot
        gameOver = true;
        messageDisplay.textContent = "Too many clicks! Game Over.";
    }
}

// Animation loop
function animate() {
    moveDot();
    requestAnimationFrame(animate);
}

// Start the game
function startGame() {
    initializeDot();
    animate();
}

// Add event listener for clicks in the game area
gameArea.addEventListener('click', (event) => {
    if (gameOver) return; // Ignore clicks if the game is over
    const rect = gameArea.getBoundingClientRect();
    const mouseX = Math.floor(event.clientX - rect.left);
    const mouseY = Math.floor(event.clientY - rect.top);
    handleGameClick(mouseX, mouseY);
});

// Call startGame to initialize
startGame();
