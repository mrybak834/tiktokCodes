import './styles/style.css';

const canvas = document.querySelector('#game-canvas');

if (!canvas) {
  throw new Error('Canvas element with id "game-canvas" was not found.');
}

const context = canvas.getContext('2d');

const gameState = {
  pixelRatio: window.devicePixelRatio || 1,
  viewportWidth: canvas.clientWidth,
  viewportHeight: canvas.clientHeight,
  keys: {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  },
  sprite: {
    size: 56,
    x: 0,
    y: 0,
    color: '#38bdf8',
    outline: '#0ea5e9',
    speed: 240, // pixels per second
    pulse: 0,
  },
  lastTimestamp: performance.now(),
};

const keyElements = Object.fromEntries(
  Object.keys(gameState.keys).map((key) => [key, document.querySelector(`[data-key="${key}"]`)]),
);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const handleResize = () => {
  gameState.pixelRatio = window.devicePixelRatio || 1;
  gameState.viewportWidth = canvas.clientWidth;
  gameState.viewportHeight = canvas.clientHeight;

  canvas.width = Math.round(gameState.viewportWidth * gameState.pixelRatio);
  canvas.height = Math.round(gameState.viewportHeight * gameState.pixelRatio);

  const half = gameState.sprite.size / 2;
  gameState.sprite.x = clamp(gameState.sprite.x || half, half, gameState.viewportWidth - half);
  gameState.sprite.y = clamp(gameState.sprite.y || half, half, gameState.viewportHeight - half);
};

const updateKeyDisplay = () => {
  Object.entries(gameState.keys).forEach(([key, isActive]) => {
    const element = keyElements[key];
    if (!element) return;
    element.classList.toggle('is-active', isActive);
    element.setAttribute('aria-checked', String(isActive));
  });
};

const handleKeyChange = (event, isActive) => {
  if (Object.prototype.hasOwnProperty.call(gameState.keys, event.key)) {
    gameState.keys[event.key] = isActive;
    updateKeyDisplay();
    event.preventDefault();
  }
};

const updateSprite = (delta) => {
  const { sprite, keys, viewportWidth, viewportHeight } = gameState;

  let horizontal = 0;
  let vertical = 0;

  if (keys.ArrowLeft) horizontal -= 1;
  if (keys.ArrowRight) horizontal += 1;
  if (keys.ArrowUp) vertical -= 1;
  if (keys.ArrowDown) vertical += 1;

  if (horizontal !== 0 || vertical !== 0) {
    const length = Math.hypot(horizontal, vertical) || 1;
    horizontal /= length;
    vertical /= length;
  }

  const movement = sprite.speed * delta;
  sprite.x += horizontal * movement;
  sprite.y += vertical * movement;

  const half = sprite.size / 2;
  sprite.x = clamp(sprite.x, half, viewportWidth - half);
  sprite.y = clamp(sprite.y, half, viewportHeight - half);

  sprite.pulse += delta * 3;
};

const drawBackground = () => {
  const { viewportWidth, viewportHeight } = gameState;
  context.save();
  context.setTransform(gameState.pixelRatio, 0, 0, gameState.pixelRatio, 0, 0);
  context.fillStyle = '#0a1426';
  context.fillRect(0, 0, viewportWidth, viewportHeight);

  const spacing = 40;
  context.strokeStyle = 'rgba(148, 163, 184, 0.08)';
  context.lineWidth = 1;

  for (let x = spacing / 2; x < viewportWidth; x += spacing) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, viewportHeight);
    context.stroke();
  }

  for (let y = spacing / 2; y < viewportHeight; y += spacing) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(viewportWidth, y);
    context.stroke();
  }
  context.restore();
};

const drawSprite = () => {
  const { sprite } = gameState;
  const { x, y, size, pulse } = sprite;
  const wobble = Math.sin(pulse) * 2;

  context.save();
  context.setTransform(gameState.pixelRatio, 0, 0, gameState.pixelRatio, 0, 0);
  context.translate(x, y + wobble);

  context.fillStyle = 'rgba(15, 23, 42, 0.4)';
  context.beginPath();
  context.ellipse(0, size * 0.4, size * 0.45, size * 0.25, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = sprite.color;
  context.strokeStyle = sprite.outline;
  context.lineWidth = 3;
  const radius = size / 2;
  context.beginPath();
  context.roundRect(-radius, -radius, size, size, 14);
  context.fill();
  context.stroke();

  context.fillStyle = '#0f172a';
  context.beginPath();
  context.arc(-radius / 3, -radius / 6, radius / 6, 0, Math.PI * 2);
  context.arc(radius / 3, -radius / 6, radius / 6, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#e0f2fe';
  context.beginPath();
  context.arc(-radius / 3 - 2, -radius / 6 - 2, radius / 12, 0, Math.PI * 2);
  context.arc(radius / 3 - 2, -radius / 6 - 2, radius / 12, 0, Math.PI * 2);
  context.fill();

  context.restore();
};

const render = () => {
  drawBackground();
  drawSprite();
};

const gameLoop = (timestamp) => {
  const delta = (timestamp - gameState.lastTimestamp) / 1000;
  gameState.lastTimestamp = timestamp;

  updateSprite(delta);
  render();

  window.requestAnimationFrame(gameLoop);
};

const initialise = () => {
  gameState.sprite.x = gameState.viewportWidth / 2;
  gameState.sprite.y = gameState.viewportHeight / 2;
  gameState.lastTimestamp = performance.now();
  updateKeyDisplay();
  render();
  window.requestAnimationFrame(gameLoop);
};

handleResize();
initialise();

window.addEventListener('resize', () => {
  handleResize();
  render();
});

window.addEventListener('keydown', (event) => handleKeyChange(event, true));
window.addEventListener('keyup', (event) => handleKeyChange(event, false));
