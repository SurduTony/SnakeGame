var foodX, foodY;

var score, highScore = 0;

var tileSize = 20;
var key;

var isGameOver;
var inMenu;

var menuManager;

var player;

var drawEnemy = false;

// sounds
var eatSound = new Audio("Sounds/eat_sound.wav");
var music = new Audio("Sounds/music.mp3");
var gameOverSound = new Audio("Sounds/game_over.wav");

var Dir = {
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3,
    STAND: 4
};
var dir;

function start() {
    var canvas = document.getElementById("canvas");

    inMenu = true;
    menuManager = new MenuManager();

    player = new Snake(100, 100);
    enemy = new Enemy(300, 300);

    initializeValues();

    generateFood();

    // input
    document.addEventListener("keypress", keyPressed, false);

    setInterval(game, 1000/15);
}

function initializeValues() {
    isGameOver = false;

    score = 0;
    player.speed = 1;
    
    enemy.speed = 1;
    enemy.tailSize = 1;

    player.x = 100;
    player.y = 100;

    enemy.x = 300;
    enemy.y = 300;

    player.tailSize = 0;

    player.tailX = [];
    player.tailY = [];

    enemy.tailX = [];
    enemy.tailY = [];

    dir = Dir.STAND;
    key = '';

    displayScore();
}

function game() {
    var ctx = canvas.getContext("2d");

    update();
    draw(ctx);
}

function update() {
    if (inMenu) {
        menuManager.update();
    }
    else {
        // game update

        player.update();

        if (drawEnemy) {
            enemy.update(player.x, player.y);
        }
        drawEnemy = !drawEnemy;

        // pause game
        if (key == 'p') {
            menuManager.currMenu = MenuState.PauseMenu;
            inMenu = true;
            key = '';
        }
    }
}

function draw(ctx) {
    if (inMenu) {
        menuManager.draw(ctx);
    }
    else {
        drawGame(ctx);
    }
}

function drawGame(ctx) {
    ctx.fillStyle = "rgb(249, 226, 197)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    ctx.fillRect(foodX, foodY, tileSize, tileSize);

    player.draw(ctx);
    enemy.draw(ctx);
}

function generateFood() {
    foodX = (parseInt(Math.random() * canvas.width / tileSize)) * tileSize;
    foodY = (parseInt(Math.random() * canvas.height / tileSize)) * tileSize;
}

function displayScore() {
    let scoreLabel = document.getElementById("score");
    scoreLabel.innerHTML = score;

    let highScoreLabel = document.getElementById("highScore");
    highScoreLabel.innerHTML = highScore;
}

function keyPressed(event) {
    switch (event.keyCode) {
        case 97: // A
            if (dir != Dir.RIGHT) dir = Dir.LEFT;
        break;
    
        case 100: // D
            if (dir != Dir.LEFT) dir = Dir.RIGHT;
        break;
    
        case 119: // W
            if (dir != Dir.DOWN) dir = Dir.UP;
        break;
    
        case 115: // S
            if (dir != Dir.UP) dir = Dir.DOWN;
        break;

        case 13: // Enter
            key = 'Enter';
            console.log(key);
        break;

        case 112:
            key = 'p'
        break;
    }

    if (!isGameOver)
        music.play();
}

// Snake
class Snake {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.speed = 1;

        this.tailSize = 0;
        this.tailX = [];
        this.tailY = [];
    }

    update() {
        // tail logic
        for (let i = this.tailSize-1; i > 0; i--) {
            this.tailX[i] = this.tailX[i-1];
            this.tailY[i] = this.tailY[i-1];
        }
        this.tailX[0] = this.x;
        this.tailY[0] = this.y;

        switch (dir) {
            case Dir.UP:
                this.y -= this.speed * tileSize;
            break;
            
            case Dir.DOWN:
                this.y += this.speed * tileSize;
            break;

            case Dir.LEFT:
                this.x -= this.speed * tileSize;
            break;

            case Dir.RIGHT:
                this.x += this.speed * tileSize;
            break;
        }

        // collision with food
        if (this.x == foodX && this.y == foodY) {
            this.tailSize++;
            score++;
            generateFood();
            displayScore();

            eatSound.play();
        }

        // loop around
        if (this.x < 0) this.x = canvas.width - tileSize;
        if (this.x >= canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height - tileSize;
        if (this.y >= canvas.height) this.y = 0;

        // death
        for (let i = 0; i < this.tailSize; i++) {
            if (this.x == this.tailX[i] && this.y == this.tailY[i]) {
                // go to death menu
                menuManager.currMenu = MenuState.DeathMenu;
                inMenu = true;

                this.speed = 0;  
                
                // stop music
                music.pause();
                music.currentTime = 0;

                gameOverSound.play();

                // highscore
                if (score > highScore) {
                    highScore = score;
                }
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = "rgb(2, 182, 17)";
        ctx.fillRect(this.x, this.y, tileSize, tileSize);

        for (let i = 0; i < this.tailSize; i++) {
            ctx.fillStyle = "rgb(59, 255, 75)";
            ctx.fillRect(this.tailX[i], this.tailY[i], tileSize, tileSize);
        }
    }
}

class Enemy extends Snake {
    constructor(x, y) {
        super(x, y);
    }

    update(x, y) {
        // tail logic
        for (let i = this.tailSize-1; i > 0; i--) {
            this.tailX[i] = this.tailX[i-1];
            this.tailY[i] = this.tailY[i-1];
        }
        this.tailX[0] = this.x;
        this.tailY[0] = this.y;

        // follow
        if (this.x == x && this.y == y) {
            menuManager.currMenu = MenuState.DeathMenu;
            inMenu = true;
            isGameOver = true;

            console.log(key);
        }

        else if (this.x > x) {
            this.x -= this.speed * tileSize;
            if (this.y > y) this.y -= this.speed * tileSize;
        }
        else if (this.x < x) {
            this.x += this.speed * tileSize;
            if (this.y < y) this.y += this.speed * tileSize;
        }
    }

    draw(ctx) {
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillRect(this.x, this.y, tileSize, tileSize);

        for (let i = 0; i < this.tailSize; i++) {
            ctx.fillStyle = "rgb(90, 80, 80)";
            ctx.fillRect(this.tailX[i], this.tailY[i], tileSize, tileSize);
        }
    }
}


// Menu Manager =====================================================
const MenuState = {
    MainMenu: 0,
    DeathMenu: 1,
    PauseMenu: 2
}

class MenuManager {
    constructor() {
        this.currMenu = MenuState.MainMenu;
    }

    update() {
        switch (this.currMenu) {
            case MenuState.MainMenu:
                this.#updateMainMenu();
            break;

            case MenuState.DeathMenu:
                this.#updateDeathMenu();
            break;

            case MenuState.PauseMenu:
                this.#updatePauseMenu();
            break;
        }

        key = '';
    }

    draw(ctx) {
        switch (this.currMenu) {
            case MenuState.MainMenu:
                this.#drawMainMenu(ctx);
            break;

            case MenuState.DeathMenu:
                this.#drawDeathMenu(ctx);
            break;

            case MenuState.PauseMenu:
                this.#drawPauseMenu(ctx);
            break;
        }
    }

    #updateMainMenu() {
        // start the game
        if (key == 'Enter') {
            inMenu = false;
        }
    }

    #updateDeathMenu() {
        // restart game
        if (key == 'Enter') {
            initializeValues();
            isGameOver = false;
            inMenu = false;
        }
    }

    #updatePauseMenu() {
        if (key == 'p') {
            inMenu = false;
        }
    }

    #drawMainMenu(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
            
        ctx.fillStyle = "white";
        ctx.font = "48px serif";
        ctx.fillText("Snake", canvas.width/3+50, canvas.height/2-50);

        ctx.font = "24px serif";
        ctx.fillText("Press Enter to start", canvas.width/3+20, canvas.height-100);
    }

    #drawDeathMenu(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
            
        ctx.fillStyle = "white";
        ctx.font = "48px serif";
        ctx.fillText("Game Over!", canvas.width/3, canvas.height/2-50);
    
        ctx.font = "24px serif";
        ctx.fillText("Press Enter to restart", canvas.width/3, canvas.height-100);
    }

    #drawPauseMenu(ctx) {
        ctx.fillStyle = "black";
        ctx.font = "48px serif";
        ctx.fillText("PAUSE", canvas.width/3+50, canvas.height/2);
    }
}