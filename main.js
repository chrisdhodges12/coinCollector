const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let playerX = 100;
let playerY = 100;
let playerRadius = 25;

// Coin variables
let coinX = 0;
let coinY = 0;
const coinRadius = 15;

// Previous coin position for burst effect
let prevCoinX = 0;
let prevCoinY = 0;

// Score counter
let score = 0;

// Physics variables
let velX = 0;
let velY = 0;
const acceleration = 0.5;
const maxSpeed = 10;
const friction = 0.95;

// Burst effect variables (for coin and player)
let burstParticles = [];
let burstActive = false;
let burstTimer = 0;
const maxBurstParticles = 30;

// Player burst effect variables
let playerBurstParticles = [];
let playerBurstActive = false;
let playerBurstTimer = 0;
const maxPlayerBurstParticles = 30;

// Track key states for Arrow keys and WASD
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    a: false,
    s: false,
    d: false
};

// Pulsing effect variables
let pulseTimer = 0;
const pulseSpeed = 0.05;  // Speed of pulsing effect

// Initialize game
function init() {
    spawnCoin();
    gameLoop();
}

// Game loop
function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply physics and movement as usual
    if (keys.ArrowUp || keys.w) velY -= acceleration;
    if (keys.ArrowDown || keys.s) velY += acceleration;
    if (keys.ArrowLeft || keys.a) velX -= acceleration;
    if (keys.ArrowRight || keys.d) velX += acceleration;

    // Apply friction
    velX *= friction;
    velY *= friction;

    // Limit max speed
    velX = Math.max(-maxSpeed, Math.min(maxSpeed, velX));
    velY = Math.max(-maxSpeed, Math.min(maxSpeed, velY));

    // Update player position
    playerX += velX;
    playerY += velY;

    // Boundary collision with momentum
    if (playerX - playerRadius < 0) {
        playerX = playerRadius;
        velX *= -0.5;
    }
    if (playerX + playerRadius > canvas.width) {
        playerX = canvas.width - playerRadius;
        velX *= -0.5;
    }
    if (playerY - playerRadius < 0) {
        playerY = playerRadius;
        velY *= -0.5;
    }
    if (playerY + playerRadius > canvas.height) {
        playerY = canvas.height - playerRadius;
        velY *= -0.5;
    }

    // Draw the flashy player
    drawPlayer();

    // Draw player burst effect if active
    if (playerBurstActive) {
        drawPlayerBurst();
    }

    // Draw the flashy coin
    drawCoin();

    // Draw burst effect if active
    if (burstActive) {
        drawBurst();
    }

    // Check for collision with the coin
    const distX = playerX - coinX;
    const distY = playerY - coinY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance < playerRadius + coinRadius) {
        prevCoinX = coinX; // Store the current coin position (before updating)
        prevCoinY = coinY;
        spawnCoin(); // Move coin to a new random position
        score++; // Increase score

        // Activate both the coin burst and player burst
        activateBurst(); // Coin burst
        activatePlayerBurst(); // Player burst
    }

    // Draw the score on the canvas
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, 10, 30);

    requestAnimationFrame(gameLoop);
}

// Spawn the coin at a random position
function spawnCoin() {
    const padding = coinRadius + 10; // Avoid spawning too close to edges
    coinX = Math.random() * (canvas.width - 2 * padding) + padding;
    coinY = Math.random() * (canvas.height - 2 * padding) + padding;
}

// Draw the flashy coin
function drawCoin() {
    // Create a glowing gradient effect
    const gradient = ctx.createRadialGradient(coinX, coinY, 5, coinX, coinY, coinRadius);
    gradient.addColorStop(0, 'gold');
    gradient.addColorStop(0.5, 'yellow');
    gradient.addColorStop(1, 'orange');

    ctx.beginPath();
    ctx.arc(coinX, coinY, coinRadius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();

    // Add a glowing effect
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(255, 223, 0, 0.8)';

    // Draw a sparkle
    ctx.beginPath();
    ctx.arc(coinX, coinY, coinRadius * 0.3, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();

    // Reset shadow for other drawings
    ctx.shadowBlur = 0;
}

// Activate the coin burst effect
function activateBurst() {
    burstActive = true;
    burstParticles = [];
    burstTimer = 0;

    // Generate particles for the coin burst effect at the previous coin position
    for (let i = 0; i < maxBurstParticles; i++) {
        let angle = Math.random() * 2 * Math.PI;
        let speed = Math.random() * 3 + 4;
        burstParticles.push({
            x: prevCoinX, // Use the previous coin position
            y: prevCoinY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 3 + 5,
            alpha: 10
        });
    }
}

// Draw the coin burst effect
function drawBurst() {
    burstParticles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.alpha -= 0.2; // Fade out particles
        particle.size *= 0.95; // Shrink particles

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(255, 223, 0, ${particle.alpha})`;
        ctx.fill();
        ctx.closePath();

        if (particle.alpha <= 0) {
            burstParticles.splice(index, 1); // Remove dead particles
        }
    });

    // If burst is done, stop the effect
    if (burstParticles.length === 0) {
        burstActive = false;
    }
}

// Activate the player burst effect
function activatePlayerBurst() {
    playerBurstActive = true;
    playerBurstParticles = [];
    playerBurstTimer = 0;

    // Generate particles for the player burst effect
    for (let i = 0; i < maxPlayerBurstParticles; i++) {
        let angle = Math.random() * 2 * Math.PI;
        let speed = Math.random() * 3 + 5;
        playerBurstParticles.push({
            x: playerX, // Burst starts from player position
            y: playerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 3 + 8,
            alpha: 1
        });
    }
}

// Draw the player burst effect
function drawPlayerBurst() {
    playerBurstParticles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.alpha -= 0.02; // Fade out particles
        particle.size *= 0.95; // Shrink particles

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(0, 255, 255, ${particle.alpha})`; // Light blue color
        ctx.fill();
        ctx.closePath();

        if (particle.alpha <= 0) {
            playerBurstParticles.splice(index, 1); // Remove dead particles
        }
    });

    // If player burst is done, stop the effect
    if (playerBurstParticles.length === 0) {
        playerBurstActive = false;
    }
}

// Draw the player with a flashy pulsing blue effect
function drawPlayer() {
    // Update the pulse timer for animation
    pulseTimer += pulseSpeed;

    // Create a pulsing glowing gradient effect
    const pulseIntensity = Math.sin(pulseTimer) * 0.2 + 0.7; // Oscillates between 0 and 1

    const gradient = ctx.createRadialGradient(playerX, playerY, 10, playerX, playerY, playerRadius);
    gradient.addColorStop(0, `rgba(0, 255, 255, ${pulseIntensity})`);  // Inner color (cyan)
    gradient.addColorStop(0.5, `rgba(0, 191, 255, ${pulseIntensity * 0.8})`); // Mid color (skyblue)
    gradient.addColorStop(1, `rgba(0, 0, 255, ${pulseIntensity * 0.5})`);  // Outer color (blue)

    ctx.beginPath();
    ctx.arc(playerX, playerY, playerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();

    // Add a glowing aura effect around the player
    ctx.shadowBlur = 30; // Intensity of glow
    ctx.shadowColor = `rgba(0, 255, 255, ${pulseIntensity})`;

    // Draw a sparkle effect around the player (optional)
    ctx.beginPath();
    ctx.arc(playerX, playerY, playerRadius * 0.2, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();

    // Reset shadow for other drawings
    ctx.shadowBlur = 0;
}

// Handle keydown and keyup events
window.addEventListener('keydown', (e) => {
    if (e.key in keys) keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key in keys) keys[e.key] = false;
});

// Start the game
init();