const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game states
let gameActive = false;
let score = 0;
const GOAL = 10;

// Player
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 50,
    width: 40,
    height: 40,
    speed: 7,
    dx: 0
};

// Arrays
let foodItems = [];
let badItems = [];
let particles = [];

// Game speed
let foodSpawnRate = 60;
let spawnCounter = 0;

// Keyboard controls
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mobile button controls
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

leftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    player.x -= 40;

    if (player.x < 0) {
        player.x = 0;
    }
});

rightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    player.x += 40;

    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
});

// Also works with mouse click
leftBtn.addEventListener('click', () => {
    player.x -= 40;

    if (player.x < 0) {
        player.x = 0;
    }
});

rightBtn.addEventListener('click', () => {
    player.x += 40;

    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
});

function startGame() {
    document.getElementById('startScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');

    gameActive = true;
    score = 0;
    document.getElementById('scoreValue').textContent = score;

    player.x = canvas.width / 2 - 20;

    foodItems = [];
    badItems = [];
    particles = [];
    spawnCounter = 0;

    gameLoop();
}

function gameLoop() {
    if (!gameActive) return;

    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Laptop keyboard movement
    player.dx = 0;

    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.dx = -player.speed;
    }

    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.dx = player.speed;
    }

    player.x += player.dx;

    // Boundary check
    if (player.x < 0) {
        player.x = 0;
    }

    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    // Spawn food and bad items
    spawnCounter++;

    if (spawnCounter > foodSpawnRate) {
        spawnCounter = 0;

        const foodTypes = ['🍔', '🍕'];
        const randomFood = foodTypes[Math.floor(Math.random() * foodTypes.length)];

        foodItems.push({
            x: Math.random() * (canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            emoji: randomFood,
            speed: 3 + Math.random()
        });

        if (Math.random() < 0.3) {
            badItems.push({
                x: Math.random() * (canvas.width - 30),
                y: -30,
                width: 30,
                height: 30,
                emoji: '😡',
                speed: 2.5 + Math.random()
            });
        }
    }

    // Update food items
    for (let i = foodItems.length - 1; i >= 0; i--) {
        foodItems[i].y += foodItems[i].speed;

        if (checkCollision(player, foodItems[i])) {
            score++;
            document.getElementById('scoreValue').textContent = score;

            createParticles(foodItems[i].x, foodItems[i].y, '❤️');
            createParticles(foodItems[i].x, foodItems[i].y, foodItems[i].emoji);

            showMessage();

            foodItems.splice(i, 1);

            if (score >= GOAL) {
                endGame();
            }
        } else if (foodItems[i].y > canvas.height) {
            foodItems.splice(i, 1);
        }
    }

    // Update bad items
    for (let i = badItems.length - 1; i >= 0; i--) {
        badItems[i].y += badItems[i].speed;

        if (checkCollision(player, badItems[i])) {
            score = Math.max(0, score - 1);
            document.getElementById('scoreValue').textContent = score;

            player.x = canvas.width / 2 - 20;

            createParticles(badItems[i].x, badItems[i].y, '😰');
            badItems.splice(i, 1);
        } else if (badItems[i].y > canvas.height) {
            badItems.splice(i, 1);
        }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].life--;
        particles[i].y -= 2;

        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👤', player.x + player.width / 2, player.y + player.height / 2);

    // Draw food
    ctx.font = '28px Arial';
    for (let food of foodItems) {
        ctx.fillText(food.emoji, food.x + food.width / 2, food.y + food.height / 2);
    }

    // Draw bad items
    ctx.font = '28px Arial';
    for (let bad of badItems) {
        ctx.fillText(bad.emoji, bad.x + bad.width / 2, bad.y + bad.height / 2);
    }

    // Draw particles
    ctx.font = '14px Arial';
    for (let particle of particles) {
        ctx.globalAlpha = particle.life / 30;
        ctx.fillText(particle.emoji, particle.x, particle.y);
        ctx.globalAlpha = 1;
    }
}

function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function createParticles(x, y, emoji) {
    for (let i = 0; i < 3; i++) {
        particles.push({
            x: x + Math.random() * 20 - 10,
            y: y,
            emoji: emoji,
            life: 30
        });
    }
}

const messages = [
    "+1 sorry point ❤️",
    "Trying hard to impress you 😭",
    "You're making me so happy 🥺",
    "Getting closer ✨",
    "I'm working on it 💪",
    "Almost there! 🌟"
];

function showMessage() {
    const msg = messages[Math.floor(Math.random() * messages.length)];
    console.log(msg);
}

function endGame() {
    gameActive = false;

    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('finalScreen').classList.add('active');
}
