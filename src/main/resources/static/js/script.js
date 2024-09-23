const gameArea = document.getElementById('gameArea');
const DOT_SIZE = 50; // Size of the dot
const TIMER_INTERVAL = 1000 / 60; // 60 FPS for smooth movement

let dot = document.createElement('div');
dot.classList.add('dot');
gameArea.appendChild(dot);

// Message display element
const messageDisplay = document.getElementById('messageDisplay');
const timerDisplay = document.getElementById('timerDisplay'); // Timer element

// Dot movement variables
let posX = Math.random() * (gameArea.clientWidth - DOT_SIZE);
let posY = Math.random() * (gameArea.clientHeight - DOT_SIZE);
let velocityX = 2; // Change to adjust speed
let velocityY = 2; // Change to adjust speed

// Game state variables
let clickCount = 0;
const MAX_CLICKS = 5; // Maximum allowed clicks
let gameOver = false;

// Timer variables
let startTime = null;
let elapsedTime = 0;
let timerInterval = null;

// Initialize the dot's position
function initializeDot() {
    posX = Math.random() * (gameArea.clientWidth - DOT_SIZE);
    posY = Math.random() * (gameArea.clientHeight - DOT_SIZE);
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
        stopTimer(); // Stop the timer

        // Prompt for user name and add result
        const playerName = prompt("You won! Enter your name:");
        const finalTime = (elapsedTime / 1000).toFixed(2);
        addResultToBackend(playerName, finalTime);
        showResultsModal();

    } else if (clickCount >= MAX_CLICKS) {
        // Reached maximum clicks without hitting the dot
        gameOver = true;
        messageDisplay.textContent = "Too many clicks! Game Over.";
        stopTimer(); // Stop the timer

        // Prompt for user name and add result with a '-' (failure) result
        const playerName = prompt("Game Over! Enter your name:");
        addResultToBackend(playerName, "-");
        showResultsModal();
    }
}

// Show the results modal
function showResultsModal() {
    document.getElementById('resultsModal').style.display = 'block';
    fetchResults(); // Fetch and display results in the modal
}

// Close the results modal
function closeResultsModal() {
    document.getElementById('resultsModal').style.display = 'none';
    resetGame(); // Reset game state for a new game
}

// Reset the game state
function resetGame() {
    gameOver = false;
    clickCount = 0;
    messageDisplay.textContent = ""; // Clear messages
    initializeDot(); // Reinitialize dot
    startTimer(); // Restart timer
    animate(); // Start animation loop
}

// Function to submit the result to the backend
function addResultToBackend(name, result) {
    fetch('http://localhost:8080/api/submitResult?name=' + encodeURIComponent(name) + '&result=' + encodeURIComponent(result), {
        method: 'POST',
    })
    .then(response => response.text())
    .then(data => {
        console.log('Response from server:', data);
    })
    .catch(error => {
        console.error('Error submitting result:', error);
    });
}

// Fetch and display results
function fetchResults() {
    fetch('http://localhost:8080/api/getResults')
        .then(response => response.json())
        .then(data => {
            console.log('Results from server:', data);
            displayResults(data); // Display results in the modal
        })
        .catch(error => console.error('Error fetching results:', error));
}

// Display the results in the modal
function displayResults(results) {
    const resultsDisplay = document.getElementById('resultsDisplay');
    resultsDisplay.innerHTML = ''; // Clear the display

    // Sort results
    const sortedResults = Object.entries(results).sort((a, b) => {
        const aTime = a[1] === '-' ? Infinity : parseFloat(a[1]);
        const bTime = b[1] === '-' ? Infinity : parseFloat(b[1]);
        return aTime - bTime; // Sort by time, then by names
    });

    // Create table for results
    const resultsTable = document.createElement('table');
    resultsTable.className = 'resultsTable';
    const headerRow = resultsTable.insertRow();
    headerRow.innerHTML = '<th>Name</th><th>Time (s)</th>';

    sortedResults.forEach(([name, result]) => {
        const row = resultsTable.insertRow();
        row.innerHTML = `<td>${name}</td><td>${result}</td>`;
        resultsTable.appendChild(row);
    });

    resultsDisplay.appendChild(resultsTable);
}

// Animation loop
function animate() {
    moveDot();
    requestAnimationFrame(animate);
}

// Timer logic
function startTimer() {
    startTime = Date.now();  // Store the current time at the start

    // Clear any existing interval
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    // Start updating the timer display
    timerInterval = setInterval(() => {
        elapsedTime = Date.now() - startTime;  // Calculate the elapsed time
        updateTimerDisplay(elapsedTime);  // Update the display
    }, 16); // Roughly 60 frames per second (16ms per frame)
}

// Function to update the timer display on the screen
function updateTimerDisplay(elapsedTime) {
    if (timerDisplay) {
        // Convert elapsedTime to seconds and display with 2 decimal places
        timerDisplay.textContent = (elapsedTime / 1000).toFixed(2) + ' s';
    }
}

// Stop the timer
function stopTimer() {
    clearInterval(timerInterval); // Stop the timer
}

// Start the game
function startGame() {
    startTimer(); // Start the timer when the game starts
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

// Start the game on page load
window.onload = function() {
    startGame();  // Call startGame when the window loads
};
