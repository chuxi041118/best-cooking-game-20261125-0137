import {
  createWorld,
  startGame,
  selectOrder,
  addIngredient,
  serveDish,
  stepWorld,
  SCREEN_TITLE,
  SCREEN_PLAY,
  SCREEN_OVER,
} from './world.js';
import { RECIPES } from './config.js';

export function stageShot(name, world, seed = 1) {
  Object.assign(world, createWorld(seed));

  if (name === 'play') {
    startGame(world);
    world.timeLeft = 74;
    world.score = 250;
    world.combo = 2;
    world.bestCombo = 3;
    world.served = 2;
    world.elapsed = 46;
    world.orders = [
      { id: 1, recipeId: 'burger', timeLeft: 32, total: 45 },
      { id: 2, recipeId: 'noodle-bowl', timeLeft: 21, total: 45 },
      { id: 3, recipeId: 'tomato-noodle', timeLeft: 12, total: 45 },
    ];
    world.nextOrderId = 10;
    world.selectedId = world.orders[0].id;
    world.assembly = ['bun', 'patty'];
    world.dishReady = false;
    world.message = { text: '', until: 0 };
    world.shake = 0;
    world.flash = 0;
    return { screen: SCREEN_PLAY, best: 250 };
  }

  if (name === 'end') {
    startGame(world);
    world.timeLeft = 0;
    world.score = 480;
    world.combo = 0;
    world.bestCombo = 4;
    world.served = 5;
    world.missed = 2;
    world.elapsed = 120;
    world.screen = SCREEN_OVER;
    world.orders = [
      { id: 1, recipeId: 'salad', timeLeft: 9, total: 45 },
    ];
    world.nextOrderId = 10;
    world.selectedId = 1;
    world.assembly = [];
    world.message = { text: '', until: 0 };
    return { screen: SCREEN_OVER, best: 480 };
  }

  world.screen = SCREEN_TITLE;
  world.orders = [
    { id: 1, recipeId: 'noodle-bowl', timeLeft: 38, total: 45 },
    { id: 2, recipeId: 'burger', timeLeft: 27, total: 45 },
    { id: 3, recipeId: 'salad', timeLeft: 15, total: 45 },
  ];
  world.selectedId = world.orders[0].id;
  world.assembly = ['noodle', 'broth'];
  world.dishReady = false;
  world.score = 0;
  world.timeLeft = 120;
  return { screen: SCREEN_TITLE, best: 0 };
}
