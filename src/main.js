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
  autopilot: {
    enabled: false,
    elapsed: 0,
    index: 0,
    sequence: [
      { keys: ['ArrowRight'], duration: 1.2 },
      { keys: ['ArrowDown'], duration: 1.2 },
      { keys: ['ArrowLeft'], duration: 1.2 },
      { keys: ['ArrowUp'], duration: 1.2 },
    ],
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

if (typeof window !== 'undefined') {
  window.__CANVAS_RUNNER_DEBUG__ = {
    getState: () => gameState,
  };
}

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

const autopilotButton = document.querySelector('.hud__autopilot');
const autopilotStatus = autopilotButton?.querySelector('.hud__autopilot-status');

const resetDirectionalKeys = () => {
  Object.keys(gameState.keys).forEach((key) => {
    gameState.keys[key] = false;
  });
};

const applyAutopilotStep = () => {
  const { autopilot } = gameState;
  const step = autopilot.sequence[autopilot.index];
  resetDirectionalKeys();

  if (!step) {
    return;
  }

  step.keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(gameState.keys, key)) {
      gameState.keys[key] = true;
    }
  });
};

const updateAutopilotButtonUI = () => {
  if (!autopilotButton) return;

  const { enabled } = gameState.autopilot;
  autopilotButton.setAttribute('aria-pressed', String(enabled));
  autopilotButton.setAttribute(
    'aria-label',
    enabled ? 'Disable autopilot' : 'Enable autopilot',
  );
  autopilotButton.classList.toggle('is-active', enabled);

  if (autopilotStatus) {
    autopilotStatus.textContent = enabled ? 'On' : 'Off';
  }
};

const setAutopilotEnabled = (enabled) => {
  const { autopilot } = gameState;
  if (autopilot.enabled === enabled) {
    return;
  }

  autopilot.enabled = enabled;
  autopilot.elapsed = 0;
  autopilot.index = 0;

  if (enabled) {
    applyAutopilotStep();
  } else {
    resetDirectionalKeys();
  }

  updateAutopilotButtonUI();
};

const updateAutopilot = (delta) => {
  const { autopilot } = gameState;

  if (!autopilot.enabled) {
    return;
  }

  if (!autopilot.sequence.length) {
    resetDirectionalKeys();
    return;
  }

  autopilot.elapsed += delta;

  let currentStep = autopilot.sequence[autopilot.index];

  while (currentStep && autopilot.elapsed >= currentStep.duration) {
    autopilot.elapsed -= currentStep.duration;
    autopilot.index = (autopilot.index + 1) % autopilot.sequence.length;
    currentStep = autopilot.sequence[autopilot.index];
  }

  applyAutopilotStep();
};

const handleKeyChange = (event, isActive) => {
  if (!Object.prototype.hasOwnProperty.call(gameState.keys, event.key)) {
    return;
  }

  if (gameState.autopilot.enabled) {
    setAutopilotEnabled(false);
  }

  gameState.keys[event.key] = isActive;
  event.preventDefault();
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

  updateAutopilot(delta);
  updateSprite(delta);
  render();

  window.requestAnimationFrame(gameLoop);
};

const initialise = () => {
  gameState.sprite.x = gameState.viewportWidth / 2;
  gameState.sprite.y = gameState.viewportHeight / 2;
  gameState.lastTimestamp = performance.now();
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

if (autopilotButton) {
  autopilotButton.addEventListener('click', () => {
    setAutopilotEnabled(!gameState.autopilot.enabled);
  });

  updateAutopilotButtonUI();
}
