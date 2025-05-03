// Game Elements
const gameArea = document.getElementById('gameArea');
const startBtn = document.getElementById('startBtn');
const gameOverScreen = document.getElementById('gameOver');
const killCountDisplay = document.getElementById('killCount');
const highScoreDisplay = document.getElementById('highScore');
const timerDisplay = document.getElementById('timer');
const finalScoreDisplay = document.getElementById('finalScore');
const finalHighScoreDisplay = document.getElementById('finalHighScore');
const restartBtn = document.getElementById('restartBtn');
const muteBtn = document.getElementById('muteBtn');
const slipperCursor = document.getElementById('slipperCursor');

// Audio Elements
const bgMusic = document.getElementById('bgMusic');
const squashSound = document.getElementById('squashSound');
const slipperSwing = document.getElementById('slipperSwing');

// Game Variables
let gameActive = false;
let killCount = 0;
let highScore = 0;
let gameTime = 0;
let gameTimer;
let cockroaches = [];
let audioEnabled = true;

// Initialize Game
function startGame() {
    gameActive = true;
    killCount = 0;
    gameTime = 0;
    
    // Reset UI
    startBtn.style.display = 'none';
    gameOverScreen.style.display = 'none';
    clearGameArea();
    
    // Update HUD
    killCountDisplay.textContent = `Kills: ${killCount}`;
    timerDisplay.textContent = `Time: ${gameTime}s`;
    
    // Start Systems
    startTimer();
    spawnCockroach();
    
    // Enable Slipper
    slipperCursor.style.display = 'block';
    
    // Play Music
    if (audioEnabled) {
        bgMusic.currentTime = 0;
        bgMusic.play().catch(e => console.log("Audio error:", e));
    }
}

// Cockroach Functions
function spawnCockroach() {
    if (!gameActive) return;
    
    const cockroach = document.createElement('div');
    cockroach.className = 'cockroach';
    
    // Random Position
    const maxX = gameArea.offsetWidth - 70;
    const maxY = gameArea.offsetHeight - 70;
    cockroach.style.left = `${Math.random() * maxX}px`;
    cockroach.style.top = `${Math.random() * maxY}px`;
    
    gameArea.appendChild(cockroach);
    cockroaches.push(cockroach);
    
    // Remove if not killed
    setTimeout(() => {
        if (!cockroach.classList.contains('dead') && gameArea.contains(cockroach)) {
            cockroach.remove();
            cockroaches = cockroaches.filter(c => c !== cockroach);
        }
    }, 2000);
    
    // Spawn next cockroach
    setTimeout(spawnCockroach, Math.max(300, 1000 - (killCount * 10)));
}

// Slipper Mechanics
document.addEventListener('mousemove', (e) => {
    if (!gameActive) return;
    slipperCursor.style.left = `${e.clientX - 50}px`;
    slipperCursor.style.top = `${e.clientY - 50}px`;
});

document.addEventListener('click', (e) => {
    if (!gameActive) return;
    
    // Slipper Animation
    slipperCursor.classList.add('slipper-swing');
    setTimeout(() => slipperCursor.classList.remove('slipper-swing'), 200);
    
    // Play Sound
    if (audioEnabled) {
        slipperSwing.currentTime = 0;
        slipperSwing.play().catch(e => console.log("Audio error:", e));
    }
    
    // Check for hits
    const slipperRect = slipperCursor.getBoundingClientRect();
    cockroaches.forEach(cockroach => {
        const cockroachRect = cockroach.getBoundingClientRect();
        if (isColliding(slipperRect, cockroachRect)) {
            killCockroach(cockroach);
        }
    });
});

function isColliding(rect1, rect2) {
    return !(
        rect1.right < rect2.left || 
        rect1.left > rect2.right || 
        rect1.bottom < rect2.top || 
        rect1.top > rect2.bottom
    );
}

function killCockroach(cockroach) {
    if (cockroach.classList.contains('dead')) return;
    
    // Mark as dead
    cockroach.classList.add('dead');
    killCount++;
    killCountDisplay.textContent = `Kills: ${killCount}`;

    // Create blood splatter
    const blood = document.createElement('div');
    blood.className = 'blood';
    const rect = cockroach.getBoundingClientRect();
    blood.style.left = `${rect.left - 15}px`;
    blood.style.top = `${rect.top - 15}px`;
    document.body.appendChild(blood);

    // Play sound effects
    if (audioEnabled) {
        squashSound.currentTime = 0;
        squashSound.play().catch(e => console.log("Audio error:", e));
    }

    // Remove elements after animation
    setTimeout(() => {
        cockroach.remove();
        blood.remove();
        cockroaches = cockroaches.filter(c => c !== cockroach);
    }, 800);
}

// Game Systems
function startTimer() {
    clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        gameTime++;
        timerDisplay.textContent = `Time: ${gameTime}s`;
        if (gameTime >= 60) endGame();
    }, 1000);
}

function clearGameArea() {
    cockroaches.forEach(c => c.remove());
    cockroaches = [];
    document.querySelectorAll('.blood').forEach(b => b.remove());
}

function endGame() {
    gameActive = false;
    clearInterval(gameTimer);
    slipperCursor.style.display = 'none';
    
    // Update High Score
    if (killCount > highScore) {
        highScore = killCount;
        highScoreDisplay.textContent = `High Score: ${highScore}`;
    }
    
    // Show Game Over
    finalScoreDisplay.textContent = `Your Score: ${killCount}`;
    finalHighScoreDisplay.textContent = `High Score: ${highScore}`;
    gameOverScreen.style.display = 'block';
    bgMusic.pause();
}

// Audio Control
function toggleAudio() {
    audioEnabled = !audioEnabled;
    muteBtn.textContent = audioEnabled ? 'Mute' : 'Unmute';
    if (audioEnabled) {
        bgMusic.play().catch(e => console.log("Audio error:", e));
    } else {
        bgMusic.pause();
    }
}

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
muteBtn.addEventListener('click', toggleAudio);
document.addEventListener('contextmenu', (e) => e.preventDefault());