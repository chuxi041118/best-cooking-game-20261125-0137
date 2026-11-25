import {
  createWorld,
  startGame,
  stepWorld,
  SCREEN_TITLE,
  SCREEN_PLAY,
  SCREEN_OVER,
} from './world.js';
import { attachInput } from './input.js';
import { draw } from './render.js';
import { SoundFX } from './audio.js';
import { stageShot } from './shots.js';
import { W, H } from './config.js';

function main() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;

  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  const seed = Number(params.get('seed') || '1') || 1;

  let best = 0;
  try {
    best = Number(localStorage.getItem('ember-kitchen-best') || '0') || 0;
  } catch (e) {
    best = 0;
  }

  const world = createWorld(seed);
  const sound = new SoundFX();
  let muted = false;

  function saveBest() {
    if (world.score > best) {
      best = world.score;
      try {
        localStorage.setItem('ember-kitchen-best', String(best));
      } catch (e) {}
    }
  }

  function drainEvents() {
    while (world.events.length) {
      const ev = world.events.shift();
      if (ev === 'over') saveBest();
      sound.playEvent(ev);
    }
  }

  const detachInput = attachInput(canvas, world, sound, {
    onStart: () => {
      sound.ensure();
      startGame(world);
    },
    onRestart: () => {
      sound.ensure();
      startGame(world);
    },
    onToggleMute: () => {
      muted = sound.toggleMute();
    },
  });

  window.__emberWorld = world;

  if (shot !== null) {
    const staged = stageShot(shot, world, seed);
    best = Math.max(best, staged.best);
    detachInput();

    function drawShot() {
      draw(ctx, world, { best, muted });
      requestAnimationFrame(drawShot);
    }

    drawShot();
    return;
  }

  const status = document.getElementById('status');
  let last = null;
  let lastStatusUpdate = -Infinity;

  function frame(now) {
    if (last === null) last = now;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    stepWorld(world, dt);
    drainEvents();
    draw(ctx, world, { best, muted });

    if (now - lastStatusUpdate >= 1000) {
      lastStatusUpdate = now;
      const seconds = Math.max(0, Math.ceil(world.timeLeft));
      const text = `Time left ${seconds}s, score ${world.score}, orders ${world.orders.length}`;
      if (status.textContent !== text) status.textContent = text;
    }

    requestAnimationFrame(frame);
  }

  drainEvents();
  requestAnimationFrame(frame);
}

main();
