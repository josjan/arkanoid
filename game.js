const CANVAS_W = 800;
const CANVAS_H = 600;

const BLOCK_COLS   = 10;
const BLOCK_ROWS   = 6;
const BLOCK_W      = 74;
const BLOCK_H      = 20;
const BLOCK_GAP_X  = 4;
const BLOCK_GAP_Y  = 4;
const BLOCK_TOP    = 60;
const BLOCK_LEFT   = (CANVAS_W - (BLOCK_COLS * BLOCK_W + (BLOCK_COLS - 1) * BLOCK_GAP_X)) / 2;

const ROW_COLORS = ['red', 'cyan', 'green', 'magenta', 'yellow', 'hotpink'];

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

// ── State ──────────────────────────────────────────────────────────────────

const state = {
  phase: 'playing',   // 'playing' | 'victory' | 'gameover'
  lives: 3,
  score: 0,
};

// x, y = top-left corner; speed in px/frame
const paddle = {
  x:     350,
  y:     560,
  w:     100,
  h:     14,
  speed: 6,
};

// x, y = centre of the sprite
const ball = {
  x:        0,
  y:        0,
  w:        16,
  h:        16,
  vx:       4,
  vy:      -4,
  attached: true,
};

const blocks = [];

// tracks which keys are held down this frame
const keys = {};

// ── Init ───────────────────────────────────────────────────────────────────

function initBlocks() {
  blocks.length = 0;
  for (let row = 0; row < BLOCK_ROWS; row++) {
    for (let col = 0; col < BLOCK_COLS; col++) {
      blocks.push({
        x:     BLOCK_LEFT + col * (BLOCK_W + BLOCK_GAP_X),
        y:     BLOCK_TOP  + row * (BLOCK_H + BLOCK_GAP_Y),
        w:     BLOCK_W,
        h:     BLOCK_H,
        color: ROW_COLORS[row],
        alive: true,
      });
    }
  }
}

function snapBallToPaddle() {
  ball.x = paddle.x + paddle.w / 2;
  ball.y = paddle.y - ball.h / 2;
}

// ── Input ──────────────────────────────────────────────────────────────────

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  paddle.x = mouseX - paddle.w / 2;
  clampPaddle();
  if (ball.attached) snapBallToPaddle();
});

window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup',   (e) => { keys[e.code] = false; });

function clampPaddle() {
  if (paddle.x < 0)                   paddle.x = 0;
  if (paddle.x > CANVAS_W - paddle.w) paddle.x = CANVAS_W - paddle.w;
}

function updatePaddle() {
  if (keys['ArrowLeft']  || keys['KeyA']) paddle.x -= paddle.speed;
  if (keys['ArrowRight'] || keys['KeyD']) paddle.x += paddle.speed;
  clampPaddle();
  if (ball.attached) snapBallToPaddle();
}

// ── Draw ───────────────────────────────────────────────────────────────────

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  for (const b of blocks) {
    if (b.alive) {
      drawSprite(ctx, 'block_' + b.color, b.x, b.y, b.w, b.h);
    }
  }

  drawSprite(ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h);
  drawSprite(ctx, 'ball', ball.x - ball.w / 2, ball.y - ball.h / 2, ball.w, ball.h);
}

// ── Game loop ──────────────────────────────────────────────────────────────

function gameLoop() {
  updatePaddle();
  draw();
  requestAnimationFrame(gameLoop);
}

// ── Boot ───────────────────────────────────────────────────────────────────

loadSpritesheet(() => {
  initBlocks();
  snapBallToPaddle();
  requestAnimationFrame(gameLoop);
});
