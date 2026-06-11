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

const canvas          = document.getElementById('gameCanvas');
const ctx             = canvas.getContext('2d');
const overlayVictory  = document.getElementById('overlay-victory');
const overlayGameover = document.getElementById('overlay-gameover');

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

canvas.addEventListener('click', () => {
  if (state.phase === 'playing' && ball.attached) ball.attached = false;
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  paddle.x = mouseX - paddle.w / 2;
  clampPaddle();
  if (ball.attached) snapBallToPaddle();
});

const GAME_KEYS = ['Space', 'ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'];

window.addEventListener('keydown', (e) => {
  if (GAME_KEYS.includes(e.code)) e.preventDefault();
  keys[e.code] = true;
  if (e.code === 'Space' && state.phase === 'playing' && ball.attached) {
    ball.attached = false;
  }
});

window.addEventListener('keyup', (e) => { keys[e.code] = false; });

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

// ── Ball physics ──────────────────────────────────────────────────────────

function updateBall() {
  if (ball.attached) return;

  ball.x += ball.vx;
  ball.y += ball.vy;

  // Left wall
  if (ball.x - ball.w / 2 <= 0) {
    ball.x = ball.w / 2;
    ball.vx = Math.abs(ball.vx);
  }
  // Right wall
  if (ball.x + ball.w / 2 >= CANVAS_W) {
    ball.x = CANVAS_W - ball.w / 2;
    ball.vx = -Math.abs(ball.vx);
  }
  // Ceiling
  if (ball.y - ball.h / 2 <= 0) {
    ball.y = ball.h / 2;
    ball.vy = Math.abs(ball.vy);
  }
  // Floor — ball lost
  if (ball.y - ball.h / 2 > CANVAS_H) {
    loseLife();
    return;
  }

  collideBlocks();
  collidePaddle();
}

function loseLife() {
  state.lives -= 1;
  if (state.lives <= 0) {
    state.phase = 'gameover';
    showOverlay('gameover');
  } else {
    ball.attached = true;
    snapBallToPaddle();
  }
}

function checkVictory() {
  if (blocks.every(b => !b.alive)) {
    state.phase = 'victory';
    showOverlay('victory');
  }
}

function collideBlocks() {
  const bLeft   = ball.x - ball.w / 2;
  const bRight  = ball.x + ball.w / 2;
  const bTop    = ball.y - ball.h / 2;
  const bBottom = ball.y + ball.h / 2;

  for (const block of blocks) {
    if (!block.alive) continue;

    if (bRight > block.x && bLeft < block.x + block.w &&
        bBottom > block.y && bTop < block.y + block.h) {
      block.alive  = false;
      state.score += 10;
      ball.vy     *= -1;
      checkVictory();
      break; // one block per frame
    }
  }
}

function collidePaddle() {
  // Only check when ball is moving downward
  if (ball.vy <= 0) return;

  const bLeft   = ball.x - ball.w / 2;
  const bRight  = ball.x + ball.w / 2;
  const bTop    = ball.y - ball.h / 2;
  const bBottom = ball.y + ball.h / 2;

  const overlapX = bRight > paddle.x && bLeft < paddle.x + paddle.w;
  const overlapY = bBottom >= paddle.y && bTop < paddle.y + paddle.h;

  if (!overlapX || !overlapY) return;

  // Place ball flush on top of paddle to avoid tunnelling
  ball.y = paddle.y - ball.h / 2;

  // Adjust vx by hit position (-1 = left edge, 0 = centre, +1 = right edge)
  const hitPos = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
  const speed  = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
  ball.vx = hitPos * speed;
  ball.vy = -Math.abs(ball.vy);

  // Prevent perfectly vertical trajectory
  if (Math.abs(ball.vx) < 1) ball.vx = ball.vx >= 0 ? 1 : -1;
}

// ── Draw ───────────────────────────────────────────────────────────────────

function drawHUD() {
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'top';

  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + state.score, 12, 12);

  ctx.textAlign = 'right';
  ctx.fillText('Lives: ' + state.lives, CANVAS_W - 12, 12);
}

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

  drawHUD();
}

// ── Game loop ──────────────────────────────────────────────────────────────

function gameLoop() {
  if (state.phase === 'playing') {
    updatePaddle();
    updateBall();
  }
  draw();
  requestAnimationFrame(gameLoop);
}

// ── Overlays & reset ──────────────────────────────────────────────────────

function showOverlay(phase) {
  if (phase === 'victory')  overlayVictory.classList.add('visible');
  if (phase === 'gameover') overlayGameover.classList.add('visible');
}

function resetGame() {
  overlayVictory.classList.remove('visible');
  overlayGameover.classList.remove('visible');

  state.phase = 'playing';
  state.lives = 3;
  state.score = 0;

  paddle.x = 350;

  ball.vx       =  4;
  ball.vy       = -4;
  ball.attached = true;

  initBlocks();
  snapBallToPaddle();
}

document.getElementById('btn-victory').addEventListener('click',  resetGame);
document.getElementById('btn-gameover').addEventListener('click', resetGame);

// ── Boot ───────────────────────────────────────────────────────────────────

loadSpritesheet(() => {
  initBlocks();
  snapBallToPaddle();
  requestAnimationFrame(gameLoop);
});
