import {
  GAME_SECONDS, ORDER_SECONDS, MAX_ORDERS, RECIPES, RECIPE_BY_ID,
} from './config.js';
import { mulberry32, pick } from './random.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

function spawnInterval(elapsed) {
  return elapsed < 60 ? 9 : 6;
}

function setMessage(world, text) {
  world.message = { text, until: world.timeLeft - 2 };
}

function clearAssembly(world) {
  world.assembly = [];
  world.dishReady = false;
}

function selectFirstOrder(world) {
  world.selectedId = world.orders[0]?.id ?? null;
  clearAssembly(world);
}

function selectedOrder(world) {
  return world.orders.find((order) => order.id === world.selectedId);
}

function finishIfOutOfTime(world) {
  if (world.timeLeft > 0) return;
  world.timeLeft = 0;
  world.screen = SCREEN_OVER;
  world.bestCombo = Math.max(world.bestCombo, world.combo);
  world.events.push('over');
}

export function createWorld(seed = 1) {
  const world = {
    seed,
    rng: mulberry32(seed),
    screen: SCREEN_TITLE,
    timeLeft: GAME_SECONDS,
    score: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    missed: 0,
    orders: [],
    nextOrderId: 1,
    selectedId: null,
    assembly: [],
    dishReady: false,
    spawnTimer: spawnInterval(0),
    message: { text: '', until: 0 },
    shake: 0,
    flash: 0,
    events: [],
    elapsed: 0,
  };
  spawnOrder(world);
  spawnOrder(world);
  return world;
}

export function resetWorld(world) {
  return Object.assign(world, createWorld(world.seed));
}

export function startGame(world) {
  resetWorld(world);
  world.screen = SCREEN_PLAY;
  world.events.push('click');
  return world;
}

export function selectOrder(world, orderId) {
  if (!world.orders.some((order) => order.id === orderId)) return;
  world.selectedId = orderId;
  clearAssembly(world);
}

export function nextStepFor(world) {
  const order = selectedOrder(world);
  if (!order) return null;
  return RECIPE_BY_ID[order.recipeId].steps[world.assembly.length] ?? null;
}

export function addIngredient(world, ingredientId) {
  if (world.screen !== SCREEN_PLAY) return false;
  if (world.selectedId === null && world.orders.length) selectFirstOrder(world);

  const next = nextStepFor(world);
  if (next !== null && ingredientId === next) {
    world.assembly.push(ingredientId);
    world.events.push('good');
    if (nextStepFor(world) === null) {
      world.dishReady = true;
      world.events.push('ready');
    }
    return true;
  }

  world.timeLeft = Math.max(0, world.timeLeft - 3);
  world.combo = 0;
  world.shake = 1;
  world.events.push('bad');
  setMessage(world, 'Wrong ingredient! -3s');
  finishIfOutOfTime(world);
  return false;
}

export function serveDish(world) {
  if (world.screen !== SCREEN_PLAY) return;
  const order = selectedOrder(world);
  if (!world.dishReady || !order) {
    world.events.push('nosoup');
    setMessage(world, 'Finish the dish first!');
    return;
  }

  const recipe = RECIPE_BY_ID[order.recipeId];
  const points = recipe.points + Math.round(order.timeLeft) * 2 + world.combo * 10;
  world.score += points;
  world.combo += 1;
  world.bestCombo = Math.max(world.bestCombo, world.combo);
  world.served += 1;
  world.orders.splice(world.orders.indexOf(order), 1);
  selectFirstOrder(world);
  world.flash = 1;
  world.events.push('serve');
  setMessage(world, `+${points} served!`);
}

export function cycleOrder(world) {
  if (!world.orders.length) return;
  const index = world.orders.findIndex((order) => order.id === world.selectedId);
  const next = world.orders[(index + 1) % world.orders.length];
  selectOrder(world, next.id);
}

export function stepWorld(world, dt) {
  if (world.screen !== SCREEN_PLAY || !Number.isFinite(dt) || dt < 0) return;

  world.elapsed += dt;
  world.timeLeft -= dt;
  world.shake = Math.max(0, world.shake - dt * 4);
  world.flash = Math.max(0, world.flash - dt * 3);

  if (world.message.text && world.timeLeft <= world.message.until) {
    world.message = { text: '', until: 0 };
  }

  const remaining = [];
  let selectedExpired = false;
  for (const order of world.orders) {
    order.timeLeft -= dt;
    if (order.timeLeft > 0) {
      remaining.push(order);
    } else {
      world.missed += 1;
      world.combo = 0;
      world.events.push('expire');
      setMessage(world, 'Order expired!');
      if (order.id === world.selectedId) selectedExpired = true;
    }
  }
  world.orders = remaining;
  if (selectedExpired) selectFirstOrder(world);

  world.spawnTimer -= dt;
  if (world.spawnTimer <= 0 && world.orders.length < MAX_ORDERS) {
    spawnOrder(world);
    world.spawnTimer = spawnInterval(world.elapsed);
  }

  finishIfOutOfTime(world);
}

export function spawnOrder(world) {
  if (world.orders.length >= MAX_ORDERS) return null;
  const recipe = pick(world.rng, RECIPES);
  const order = {
    id: world.nextOrderId++,
    recipeId: recipe.id,
    timeLeft: ORDER_SECONDS,
    total: ORDER_SECONDS,
  };
  world.orders.push(order);
  if (world.orders.length === 1) selectOrder(world, order.id);
  return order;
}
