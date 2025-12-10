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

// ground position (pixels from canvas top)
const GROUND_Y = canvas.height * 0.8; // 80% canvas height

// Gravity and strength of the jump
const GRAVITY = 0.5;      // bigger, faster it falls
const JUMP_STRENGTH = 12; // bigger, stronger the jump

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
  ctx.fillStyle = "black";
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// ---- Game loop ----

function update() {
  updatePlayer();
}

function draw() {
  clearCanvas();
  drawGround();
  drawPlayer();
}

// Game loop : calls update + draw on each fram
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start loop
gameLoop();