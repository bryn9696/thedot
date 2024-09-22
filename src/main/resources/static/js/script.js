const gameArea = document.getElementById('gameArea');
const startButton = document.getElementById('startButton');
const timerDisplay = document.getElementById('timerDisplay');
const DOT_SIZE = 50;
let timer;
let startTime;

// Add event listener to the Start button
startButton.addEventListener('click', startGame);

// Start the game by making a request to the backend and initializing the timer
function startGame() {
    fetch('/api/start')
        .then(response => response.text())
        .then(message => {
            console.log(message);
            fetchDot();  // Fetch the initial dot position
            startTimer();  // Start the game timer
            setInterval(fetchDot, 1000);  // Periodically update the dot position
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Fetch the current dot's position from the backend
function fetchDot() {
    fetch('/api/dot')
        .then(response => response.json())
        .then(dot => {
            moveDot(dot.x, dot.y);
        })
        .catch(error => {
            console.error('Error fetching dot:', error);
        });
}

// Move the dot or create it if it doesn't exist
function moveDot(x, y) {
    let dot = document.querySelector('.dot');
    if (dot) {
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
    } else {
        createDot(x, y);
    }
}

// Create a new dot element and position it
function createDot(x, y) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;

    // Attach the click handler to the dot
    dot.addEventListener('click', (event) => {
        const rect = gameArea.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        handleDotClick(mouseX, mouseY);
    });

    gameArea.appendChild(dot);
}

// Handle the dot click event
function handleDotClick(mouseX, mouseY) {
    // Convert to integers
    const intMouseX = Math.floor(mouseX);
    const intMouseY = Math.floor(mouseY);

    clickDot(intMouseX, intMouseY);
}

// Send a request to notify the backend of the dot click
function clickDot(mouseX, mouseY) {
    fetch(`/api/click?mouseX=${mouseX}&mouseY=${mouseY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    })
    .then(response => response.text())
    .then(result => {
        console.log('Response from server:', result);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Start the timer
function startTimer() {
    startTime = Date.now();
    timer = setInterval(updateTimer, 100);
}

// Update the timer display
function updateTimer() {
    const elapsedTime = Date.now() - startTime;
    timerDisplay.textContent = `Time: ${(elapsedTime / 1000).toFixed(2)}s`;
}
