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
let velocityX = 4; // Change to adjust speed
let velocityY = 4; // Change to adjust speed

// Game state variables
let clickCount = 0;
const MAX_CLICKS = 5; // Maximum allowed clicks
let gameOver = false;

// Timer variables
let startTime = null;
let elapsedTime = 0;
let timerInterval = null;
let animationFrameId = null; // Store the ID of the current animation frame

// Share Result Variables
let finalTime = 0;
let finalClicks = 0;

// Detect environment (development or production)
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8080'  // Local development
  : 'https://the-dot-game-ab1b89814a75.herokuapp.com';

// Initialize the dot's position
function initializeDot() {
    const gameAreaWidth = gameArea.clientWidth - DOT_SIZE;
    const gameAreaHeight = gameArea.clientHeight - DOT_SIZE;
    posX = Math.random() * gameAreaWidth;
    posY = Math.random() * gameAreaHeight;
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

// Handle interaction (clicks or touches) in the game area
async function handleGameInteraction(x, y) {
    clickCount++;

    // Check if the click/touch is inside the dot
    const isHit = x >= posX && x <= posX + DOT_SIZE && y >= posY && y <= posY + DOT_SIZE;

    if (isHit) {
        messageDisplay.textContent = "You win!";
        gameOver = true; // End the game
        stopTimer(); // Stop the timer
        let playerName;
        do {
            playerName = prompt("You won! Enter your name:");
            existingNames = await fetchExistingNames(); // Fetch existing names
            if (existingNames.includes(playerName)) {
                alert("Name already taken, please enter a new name.");
            }
        } while (existingNames.includes(playerName) && playerName);

        if (playerName) {
            finalTime = (elapsedTime / 1000).toFixed(2);
            finalClicks = clickCount; // Update final clicks
            await addResultToBackend(playerName, finalTime, finalClicks);
            showResultsModal();
        }

    } else if (clickCount >= MAX_CLICKS) {
        // Reached maximum clicks without hitting the dot
        gameOver = true;
        messageDisplay.textContent = "Too many clicks! Game Over.";
        stopTimer(); // Stop the timer

        let playerName;
        do {
            playerName = prompt("Game Over! Enter your name:");
            existingNames = await fetchExistingNames();
            if (existingNames.includes(playerName)) {
                alert("Name already taken, please enter a new name.");
            }
        } while (existingNames.includes(playerName) && playerName);

        if (playerName) {
            await addResultToBackend(playerName, "-", clickCount);
            showResultsModal();
        }
    }
}

// Fetch existing names from the backend
async function fetchExistingNames() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/getResults`);
        const data = await response.json();
        return Object.keys(data);
    } catch (error) {
        console.error('Error fetching existing names:', error);
        return [];
    }
}

// Function to submit the result to the backend
async function addResultToBackend(name, result, clicks) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/submitResult?name=${encodeURIComponent(name)}&result=${encodeURIComponent(result)}&clicks=${encodeURIComponent(clicks)}`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }

        const data = await response.text();
        console.log('Response from server:', data);
        await fetchResults(); // Fetch updated results after submission
    } catch (error) {
        console.error('Error submitting result:', error);
    }
}

// Function to fetch results from the backend and display them
async function fetchResults() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/getResults`);
        const data = await response.json();
        const resultsDisplay = document.getElementById('resultsDisplay');
        resultsDisplay.innerHTML = ""; // Clear previous results

        const resultsTable = document.createElement('table');
        resultsTable.className = 'resultsTable';
        resultsTable.innerHTML = "<tr><th>Name</th><th>Result</th><th>Clicks</th></tr>"; // Table header

        const sortedResults = Object.entries(data).sort((a, b) => {
            const aTime = a[1].result === '-' ? Infinity : parseFloat(a[1].result);
            const bTime = b[1].result === '-' ? Infinity : parseFloat(b[1].result);
            return aTime - bTime;
        });

        sortedResults.forEach(([name, resultData]) => {
            const result = resultData.result;
            const clicks = resultData.clicks;
            const row = document.createElement('tr');
            row.innerHTML = `<td>${name}</td><td>${result}</td><td>${clicks}</td>`;
            resultsTable.appendChild(row);
        });

        resultsDisplay.appendChild(resultsTable);
    } catch (error) {
        console.error('Error fetching results:', error);
    }
}

// Show the results modal
function showResultsModal() {
    document.getElementById('resultsModal').style.display = 'block';
    fetchResults();

    updateShareButtons(finalTime, finalClicks); // Update share buttons with final results
}

// Close the results modal and restart the game
function closeResultsModal() {
    document.getElementById('resultsModal').style.display = 'none';
    resetGame();
    dot.style.display = "block"; // Ensure the dot is visible again
}

// Reset the game state
function resetGame() {
    gameOver = false;
    clickCount = 0;
    messageDisplay.textContent = "";
    stopGame();
    initializeDot();
    startTimer();
    animate();
}

// Stop the game (cancel animation and hide dot)
function stopGame() {
    cancelAnimationFrame(animationFrameId);
    dot.style.display = "none";
}

// Start the game
function startGame() {
    resetGame();
    dot.style.display = "block";
    animate();
}

// Start the timer
function startTimer() {
    startTime = performance.now();
    timerInterval = setInterval(() => {
        elapsedTime = performance.now() - startTime;
        timerDisplay.textContent = `${(elapsedTime / 1000).toFixed(2)} s`;
    }, TIMER_INTERVAL);
}

// Stop the timer
function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

// Animation loop for moving the dot
function animate() {
    moveDot();
    animationFrameId = requestAnimationFrame(animate);
}

// Event listener for mouse clicks
gameArea.addEventListener('click', (event) => {
    const rect = gameArea.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    handleGameInteraction(mouseX, mouseY);
});

// Event listener for touch events
gameArea.addEventListener('touchstart', (event) => {
    const rect = gameArea.getBoundingClientRect();
    const touch = event.touches[0];
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    handleGameInteraction(touchX, touchY);
});

// Update the share buttons with the final results
function updateShareButtons(time, clicks) {
    const shareTwitter = document.getElementById('shareTwitter');
    const shareFacebook = document.getElementById('shareFacebook');
    const shareClipboard = document.getElementById('copyToClipboard');
    const resultsDisplay = document.getElementById('resultsDisplay'); // Get the results display element

    const gameUrl = 'https://tinyurl.com/5n96d8bh';
    const message = `I completed the Dot Game in ${time} seconds and ${clicks} clicks! Can you beat my score? 🔴 Play here: ${gameUrl} `;
    resultsDisplay.innerHTML = message; // Assuming resultsDisplay is where you show the message

    shareTwitter.onclick = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        window.open(twitterUrl, '_blank');
    };

    shareFacebook.onclick = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=https://the-dot-game-ab1b89814a75.herokuapp.com&quote=${encodeURIComponent(message)}`;
        window.open(facebookUrl, '_blank');
    };

    // Copy to clipboard logic
    shareClipboard.onclick = () => {
        navigator.clipboard.writeText(message).then(() => {
            alert("Results copied to clipboard!");
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };
}

// Start the game when the script loads
startGame();
