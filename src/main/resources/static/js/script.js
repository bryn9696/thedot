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

// Fetch existing names from the backend
async function fetchExistingNames() {
    try {
        const response = await fetch('https://the-dot-b82bb75a3fcb.herokuapp.com//api/getResults');
        const data = await response.json();
        return Object.keys(data); // Assuming keys are player names
    } catch (error) {
        console.error('Error fetching existing names:', error);
        return []; // Return an empty array on error
    }
}

// Handle mouse click in game area
async function handleGameClick(mouseX, mouseY) {
    clickCount++;

    // Check if the click is inside the dot
    const isHit = mouseX >= posX && mouseX <= posX + DOT_SIZE && mouseY >= posY && mouseY <= posY + DOT_SIZE;

    // Declare existingNames outside the do...while loop
    let existingNames;

    if (isHit) {
        // Successfully clicked the dot
        messageDisplay.textContent = "You win!";
        gameOver = true; // End the game
        stopTimer(); // Stop the timer

        // Prompt for user name and check for duplicates
        let playerName;
        do {
            playerName = prompt("You won! Enter your name:");
            existingNames = await fetchExistingNames(); // Fetch existing names
            if (existingNames.includes(playerName)) {
                alert("Name already taken, please enter a new name.");
            }
        } while (existingNames.includes(playerName) && playerName); // Repeat until a unique name is entered

        if (playerName) {
            const finalTime = (elapsedTime / 1000).toFixed(2);
            await addResultToBackend(playerName, finalTime, clickCount); // Pass click count
            showResultsModal();
        }

    } else if (clickCount >= MAX_CLICKS) {
        // Reached maximum clicks without hitting the dot
        gameOver = true;
        messageDisplay.textContent = "Too many clicks! Game Over.";
        stopTimer(); // Stop the timer

        // Prompt for user name and check for duplicates
        let playerName;
        do {
            playerName = prompt("Game Over! Enter your name:");
            existingNames = await fetchExistingNames(); // Fetch existing names
            if (existingNames.includes(playerName)) {
                alert("Name already taken, please enter a new name.");
            }
        } while (existingNames.includes(playerName) && playerName); // Repeat until a unique name is entered

        if (playerName) {
            await addResultToBackend(playerName, "-", clickCount); // Pass click count
            showResultsModal();
        }
    }
}

// Show the results modal
function showResultsModal() {
    document.getElementById('resultsModal').style.display = 'block';
    fetchResults(); // Fetch and display results in the modal
}

// Close the results modal and restart the game
function closeResultsModal() {
    document.getElementById('resultsModal').style.display = 'none';
    resetGame(); // Reset game state for a new game
    dot.style.display = "block"; // Ensure the dot is visible again
}

// Reset the game state
function resetGame() {
    gameOver = false;
    clickCount = 0;
    messageDisplay.textContent = ""; // Clear messages
    stopGame(); // Stop the previous game animation before restarting
    initializeDot(); // Reinitialize dot
    startTimer(); // Restart timer
    animate(); // Start animation loop
}

// Function to submit the result to the backend
function addResultToBackend(name, result, clicks) {
    fetch('https://the-dot-b82bb75a3fcb.herokuapp.com//api/submitResult?name=' + encodeURIComponent(name) + '&result=' + encodeURIComponent(result) + '&clicks=' + encodeURIComponent(clicks), {
        method: 'POST',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.text();
    })
    .then(data => {
        console.log('Response from server:', data);
        fetchResults(); // Fetch results immediately after submitting
    })
    .catch(error => {
        console.error('Error submitting result:', error);
    });
}


// Function to fetch results from the backend and display them
async function fetchResults() {
    try {
        const response = await fetch('https://the-dot-b82bb75a3fcb.herokuapp.com//api/getResults');
        const data = await response.json();
        const resultsDisplay = document.getElementById('resultsDisplay');
        resultsDisplay.innerHTML = ""; // Clear previous results

        // Create a table to display results
        const resultsTable = document.createElement('table');
        resultsTable.className = 'resultsTable';
        resultsTable.innerHTML = "<tr><th>Name</th><th>Result</th><th>Clicks</th></tr>"; // Table header

        // Sort results by time, with losing results sorted to the end
        const sortedResults = Object.entries(data).sort((a, b) => {
            const aTime = a[1].result === '-' ? Infinity : parseFloat(a[1].result);
            const bTime = b[1].result === '-' ? Infinity : parseFloat(b[1].result);
            return aTime - bTime; // Sort by result time
        });

        // Create rows for each result
        sortedResults.forEach(([name, resultData]) => {
            const result = resultData.result; // Get the result
            const clicks = resultData.clicks; // Get the clicks
            const row = document.createElement('tr');
            row.innerHTML = `<td>${name}</td><td>${result}</td><td>${clicks}</td>`; // Display clicks
            resultsTable.appendChild(row);
        });

        resultsDisplay.appendChild(resultsTable); // Append the results table
    } catch (error) {
        console.error('Error fetching results:', error);
    }
}


// Stop the game (cancel animation and hide dot)
function stopGame() {
    cancelAnimationFrame(animationFrameId); // Stop the animation loop
    dot.style.display = "none"; // Hide the dot
}

// Start the game
function startGame() {
    resetGame(); // Reset the game state

    dot.style.display = "block"; // Show the dot
    animate(); // Start the animation loop
}

// Start the timer
function startTimer() {
    startTime = performance.now(); // Get the current time
    timerInterval = setInterval(() => {
        elapsedTime = performance.now() - startTime; // Calculate elapsed time
        timerDisplay.textContent = `${(elapsedTime / 1000).toFixed(2)} s`; // Update timer display
    }, TIMER_INTERVAL);
}

// Stop the timer
function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

// Animation loop for moving the dot
function animate() {
    moveDot(); // Move the dot
    animationFrameId = requestAnimationFrame(animate); // Request the next frame
}

// Event listener for clicks in the game area
gameArea.addEventListener('click', (event) => {
    const rect = gameArea.getBoundingClientRect(); // Get the bounding rect of the game area
    const mouseX = event.clientX - rect.left; // Calculate mouse X relative to game area
    const mouseY = event.clientY - rect.top; // Calculate mouse Y relative to game area
    handleGameClick(mouseX, mouseY); // Handle the click
});

// Start the game when the script loads
startGame();
