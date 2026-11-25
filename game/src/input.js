import { W, H, INGREDIENTS, LAYOUT } from './config.js';
import {
  SCREEN_TITLE,
  SCREEN_PLAY,
  SCREEN_OVER,
  selectOrder,
  addIngredient,
  serveDish,
  cycleOrder,
} from './world.js';

export function attachInput(canvas, world, sound, callbacks) {
  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * W / rect.width,
      y: (event.clientY - rect.top) * H / rect.height,
    };
  }

  function inside(rect, x, y) {
    return x >= rect.x && x <= rect.x + rect.w &&
      y >= rect.y && y <= rect.y + rect.h;
  }

  function onMouseDown(event) {
    sound.ensure();

    if (world.screen === SCREEN_TITLE) {
      callbacks.onStart();
      return;
    }
    if (world.screen === SCREEN_OVER) {
      callbacks.onRestart();
      return;
    }
    if (world.screen !== SCREEN_PLAY) return;

    const { x, y } = toLogical(event);

    if (inside(LAYOUT.serveRect(), x, y)) {
      serveDish(world);
      return;
    }

    for (let i = 0; i < world.orders.length; i++) {
      if (inside(LAYOUT.ticketRect(i), x, y)) {
        selectOrder(world, world.orders[i].id);
        return;
      }
    }

    for (let i = 0; i < INGREDIENTS.length; i++) {
      if (inside(LAYOUT.binRect(i), x, y)) {
        addIngredient(world, INGREDIENTS[i].id);
        return;
      }
    }

    if (inside(LAYOUT.plateRect(), x, y)) {
      serveDish(world);
    }
  }

  function onKeyDown(event) {
    sound.ensure();
    const key = event.key.toLowerCase();

    switch (key) {
      case 'enter':
      case ' ':
        if (world.screen === SCREEN_TITLE) callbacks.onStart();
        else if (world.screen === SCREEN_OVER) callbacks.onRestart();
        else if (world.screen === SCREEN_PLAY) serveDish(world);
        return;
      case 'r':
        if (world.screen === SCREEN_OVER) callbacks.onRestart();
        return;
      case 'm':
        callbacks.onToggleMute();
        return;
      case 'tab':
        event.preventDefault();
        if (world.screen === SCREEN_PLAY) cycleOrder(world);
        return;
      case 'q':
        if (world.screen === SCREEN_PLAY) cycleOrder(world);
        return;
      case 'escape':
        return;
      default:
        if (world.screen === SCREEN_PLAY && /^[1-9]$/.test(key)) {
          const ingredient = INGREDIENTS[Number(key) - 1];
          if (ingredient) addIngredient(world, ingredient.id);
        }
    }
  }

  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('keydown', onKeyDown);

  return function detach() {
    canvas.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('keydown', onKeyDown);
  };
}
