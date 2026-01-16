// ---- Setup Canvas ----
const canvas = document.querySelector<HTMLCanvasElement>("#game")!;
const ctx = canvas.getContext("2d")!;

// Adjust canvas size 
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.5;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas)

// Player interface
interface Player {
  x: number;      // horizontal position
  y: number;      // vertical position (top left corner)
  width: number;  // width rectangle
  height: number; // height rectangle
  vy: number;     // vertical speed (pixels / frame)
  isOnGround: boolean; // player touches the ground ?
}

// Obstacle interface
interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number; // horizontal speed
  type: "GROUND" | "AIR";
}

// ground position (pixels from canvas top)
const GROUND_Y = canvas.height * 0.8; // 80% canvas height

// Gravity and strength of the jump
const GRAVITY = 0.5;      // bigger, faster it falls
const JUMP_STRENGTH = 12; // bigger, stronger the jump

// Const for speed game
const OBSTACLE_BASE_SPEED = 5;
const OBSTACLE_MAX_SPEED = 20;
const SPEED_PER_POINT = 0.002;

// Position obstacle aerial
const AIR_OBSTACLE_OFFSET = 80;

// Sprite sheet
const PLAYER_FRAME_WIDTH = 80;
const PLAYER_FRAME_HEIGHT = 110;
const RUN_FRAMES = 2
const JUMP_FRAME_INDEX = 2;
const RUN_ROW = 1;
const JUMP_ROW = 2;

// Character image (Sprite sheet)
const playerSheet = new Image();
const obstacleSheet = new Image();

playerSheet.src = "/image/player_tilesheet.png";
obstacleSheet.src = "/image/bush.png";

let playerImgReady = false;
let obstacleImgReady = false;

playerSheet.onload = () => { playerImgReady = true; };
obstacleSheet.onload = () => { obstacleImgReady = true; };

let playerFrameIndex = 0;
let playerAnimeFrames = 0;

// Player
const player: Player = {
  x: 50,
  // Player position on the ground : groundY - its height
  y: GROUND_Y - 50,
  width: 40,
  height: 50,
  vy: 0,
  isOnGround: true,
};

// Obstacle 
const obstacles: Obstacle[] = [
  {
    x: canvas.width + 200,
    y: GROUND_Y - 25,
    width: 40,
    height: 25,
    vx: 5,
    type: "GROUND",
  }
];

// State game over and game over frames
type GameState = "WAITING" | "PLAYING" | "GAME_OVER";
let gameState: GameState = "WAITING";
let gameOverFrames = 0;
// State for score
let score = 0;
// State spawn count
let obstacleSpawnCount = 0;

// ---- Inputs (keyboard) ----

/* -- Used to find out the name of the keyboard keys

window.adEventListener("keydown", (event) => {
console.log(event.code, event.key);
});*/
let isJumpKeyPressed = false;

// key pressed
window.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    isJumpKeyPressed = true;
  }
});

// key released
window.addEventListener("keyup", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    isJumpKeyPressed = false;
  }
});

// ---- Player update logic ----

function updatePlayer() {
  // if key pressed and ground player == jump
  if (isJumpKeyPressed && player.isOnGround) {
    player.vy = -JUMP_STRENGTH; // upwards = negative speed
    player.isOnGround = false;
  }

  // Apply gravity if player not on the ground
  if (!player.isOnGround) {
    player.vy += GRAVITY;
    player.y += player.vy;
  }

  // Check if player on the ground
  const playerBottom = player.y + player.height;

  if (playerBottom >= GROUND_Y) {
    // Readjust the position on the ground
    player.y = GROUND_Y - player.height;
    player.vy = 0;
    player.isOnGround = true;
  }
}

// ---- Obstacle update logic ----

function updateObstacles() {
  // loop over the object array
  for (const obstacle of obstacles) {
    // Apply the movement to the left
    obstacle.x -= obstacle.vx
    // Size
    obstacle.width = 40;
    obstacle.height = 25;
    // Check if the obstacle is outside
    if ((obstacle.x + obstacle.width) < 0) {
      obstacle.x = canvas.width + 200;
      obstacleSpawnCount++;
      if (obstacleSpawnCount % 2 === 0) {
        obstacle.type = "GROUND";
        obstacle.y = GROUND_Y - obstacle.height;
      }
      else {
        obstacle.type = "AIR";
        obstacle.y = GROUND_Y - obstacle.height - AIR_OBSTACLE_OFFSET;
      }
    }
  }
}

// ---- Collision function ----

// Rules AABB (Axis Aligned Bounding Box)
function checkCollision(player: Player, obstacle: Obstacle): boolean {
  const isLeft = player.x + player.width < obstacle.x;
  const isRight = player.x > obstacle.x + obstacle.width;
  const isAbove = player.y + player.height < obstacle.y;
  const isBelow = player.y > obstacle.y + obstacle.height;

  // If completly left, right, above or below -> collision = false
  if (isLeft || isRight || isAbove || isBelow) {
    return false;
  }

  // Elseif -> collision = true
  return true;
}

// ---- Drawing functions ----

// Clear the screen
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Draw the ground
function drawGround() {
  ctx.fillStyle = "#444";
  ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
}

// Draw the player (rectangle to start)
function drawPlayer() {
  const sxRun = playerFrameIndex * PLAYER_FRAME_WIDTH;
  const sxJump = JUMP_FRAME_INDEX * PLAYER_FRAME_WIDTH;
  const syRun = RUN_ROW * PLAYER_FRAME_HEIGHT;
  const syJump = JUMP_ROW * PLAYER_FRAME_HEIGHT;

  if (!playerImgReady) {
    ctx.fillStyle = "black";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    return;
  }

  if (!player.isOnGround) {
    ctx.drawImage(
      playerSheet,
      sxJump,
      syJump,
      PLAYER_FRAME_WIDTH,
      PLAYER_FRAME_HEIGHT,
      player.x,
      player.y,
      player.width,
      player.height
    )
    return;
  }

  ctx.drawImage(
    playerSheet,
    sxRun,
    syRun,
    PLAYER_FRAME_WIDTH,
    PLAYER_FRAME_HEIGHT,
    player.x,
    player.y,
    player.width,
    player.height
  );
}

// Draw the obstacle
function drawObstacles() {
  for (const obstacle of obstacles) {
    if (!obstacleImgReady) {
      ctx.fillStyle = "red";
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
    else {
      ctx.drawImage(obstacleSheet, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
  }
}

// ---- Game loop ----

function update() {
  // GAME OVER = no move, animation and restart
  if (gameState === "GAME_OVER") {
    gameOverFrames += 1;

    // Press Space -> restart
    if (isJumpKeyPressed) {
      resetGame();
      gameState = "PLAYING";    // start directly
      isJumpKeyPressed = false; // avoid double input
    }

    return;
  }

  // WAITING = start screen (no move)
  if (gameState === "WAITING") {
    if (isJumpKeyPressed) {
      gameState = "PLAYING";
      isJumpKeyPressed = false; // avoid double input
    }
    return;
  }

  score += 1;
  const currentSpeed = Math.min(OBSTACLE_MAX_SPEED, OBSTACLE_BASE_SPEED + score * SPEED_PER_POINT);
  updatePlayer();
  updateObstacles();

  // % 10 = fluid for 60 FPS
  playerAnimeFrames++;
  if (playerAnimeFrames % 10 === 0) {
    playerFrameIndex = (playerFrameIndex + 1) % RUN_FRAMES;
  }

  if (player.isOnGround) {
    playerAnimeFrames++;
    if (playerAnimeFrames % 10 === 0) {
      playerFrameIndex = playerFrameIndex === 0 ? 1 : 0;
    }
  }

  for (const obstacle of obstacles) {
    obstacle.vx = currentSpeed;
    if (checkCollision(player, obstacle)) {
      gameState = "GAME_OVER";
      gameOverFrames = 0;
      break;
    }
  }
}

// Reset after Game Over
function resetGame() {
  gameOverFrames = 0;
  score = 0;

  player.y = GROUND_Y - player.height;
  player.vy = 0;
  player.isOnGround = true;

  for (const obstacle of obstacles) {
    obstacle.x = canvas.width + 200;
  }

  isJumpKeyPressed = false;
}

// Displays the current game state, never modifies game data
function draw() {
  // Margin for score
  const margin = 20;
  // X and Y for center canvas
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  clearCanvas();
  drawGround();
  drawObstacles();
  drawPlayer();

  // Displaying Score
  ctx.save();
  ctx.font = "20px sans-serif";
  ctx.textBaseline = "top";
  ctx.textAlign = "right";
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, canvas.width - margin, margin);
  ctx.restore();

  // Displaying the text with blinking effect
  if (gameState === "GAME_OVER") {
    const blinkPeriod = 30;
    const blinkOn = (Math.floor(gameOverFrames / blinkPeriod) % 2) === 0;
    if (blinkOn) {
      // Save the graphical state of the context (style, alignment, etc)
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "48px sans-serif";
      // Spacing line
      const lineSpacing = 50;
      ctx.fillText("GAME OVER", centerX, centerY);
      ctx.fillText("Press Space to restart", centerX, centerY + lineSpacing);
      // Restores a previous state
      ctx.restore();
    }
  }
  else if (gameState === "WAITING") {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "48px sans-serif";
    ctx.fillText("Press Space to start", centerX, centerY);
    ctx.restore();
  }
}

// Game loop : calls update + draw on each fram
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
// Start loop
gameLoop();