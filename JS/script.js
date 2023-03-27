var playerX, playerY;
var foodX, foodY;

var score;
var speed;

var tileSize = 20;
var key;

var tailSize;
var tailX = [], tailY = [];

var isGameOver;

function start() {
    var canvas = document.getElementById("canvas");

    initializeValues();

    generateFood();

    // input
    document.addEventListener("keypress", keyPressed, false);

    setInterval(game, 1000/15);
}

function initializeValues() {
    isGameOver = false;

    score = 0;
    speed = 1;

    playerX = 100;
    playerY = 100;

    tailSize = 0;

    tailX = [];
    tailY = [];

    key = '';

    displayScore();
}

function game() {
    var ctx = canvas.getContext("2d");

    update();
    draw(ctx);
}

function update() {
    // tail logic
    for (let i = tailSize-1; i > 0; i--) {
        tailX[i] = tailX[i-1];
        tailY[i] = tailY[i-1];
    }
    tailX[0] = playerX;
    tailY[0] = playerY;

    switch (key) {
        case 'W':
            playerY -= speed * tileSize;
        break;
        
        case 'S':
            playerY += speed * tileSize;
        break;

        case 'A':
            playerX -= speed * tileSize;
        break;

        case 'D':
            playerX += speed * tileSize;
        break;

        // restart
        case ' ':
            if (isGameOver) {
                initializeValues();
                isGameOver = false;
            }
        break;
    }

    // collision with food
    if (playerX == foodX && playerY == foodY) {
        tailSize++;
        score++;
        generateFood();
        displayScore();
    }

    // loop around
    if (playerX < 0) playerX = canvas.width - tileSize;
    if (playerX >= canvas.width) playerX = 0;
    if (playerY < 0) playerY = canvas.height - tileSize;
    if (playerY >= canvas.height) playerY = 0;

    // death
    for (let i = 0; i < tailSize; i++) {
        if (playerX == tailX[i] && playerY == tailY[i])
            isGameOver = true;
    }
}

function draw(ctx) {
    if (!isGameOver) {
        drawGame(ctx);
    }
    else {
        drawDeathScreen(ctx);   
    }
}

function drawGame(ctx) {
    ctx.fillStyle = "rgb(249, 226, 197)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    ctx.fillRect(foodX, foodY, tileSize, tileSize);

    ctx.fillStyle = "rgb(2, 182, 17)";
    ctx.fillRect(playerX, playerY, tileSize, tileSize);

    for (let i = 0; i < tailSize; i++) {
        ctx.fillStyle = "rgb(59, 255, 75)";
        ctx.fillRect(tailX[i], tailY[i], tileSize, tileSize);
    }
}

function drawDeathScreen(ctx) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
        
    ctx.fillStyle = "white";
    ctx.font = "48px serif";
    ctx.fillText("Game Over!", canvas.width/3, canvas.height/2-50);

    ctx.font = "24px serif";
    ctx.fillText("Press space to restart", canvas.width/3, canvas.height-100);
}

function generateFood() {
    foodX = (parseInt(Math.random() * canvas.width / tileSize)) * tileSize;
    foodY = (parseInt(Math.random() * canvas.height / tileSize)) * tileSize;
}

function displayScore() {
    let scoreLabel = document.getElementById("score");
    scoreLabel.innerHTML = score;
}

function keyPressed(event) {

    switch (event.keyCode) {
        case 97:
            if (key != 'D') key = 'A';
        break;
    
        case 100:
            if (key != 'A') key = 'D';
        break;
    
        case 119:
            if (key != 'S') key = 'W';
        break;
    
        case 115:
            if (key != 'W') key = 'S';
        break;

        case 32:
            key = ' ';
        break;
    }
}