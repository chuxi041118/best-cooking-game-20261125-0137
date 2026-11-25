export const W = 1280;
export const H = 720;
export const GAME_SECONDS = 120;
export const ORDER_SECONDS = 45;
export const MAX_ORDERS = 3;

export const INGREDIENTS = [
  { id: 'bun', name: 'Bun', color: '#e8b06a', dark: '#a66b32' },
  { id: 'patty', name: 'Patty', color: '#7a4a2b', dark: '#4d2a17' },
  { id: 'cheese', name: 'Cheese', color: '#ffc93c', dark: '#b78319' },
  { id: 'lettuce', name: 'Lettuce', color: '#7bc96f', dark: '#43853a' },
  { id: 'tomato', name: 'Tomato', color: '#e74c3c', dark: '#9c2d22' },
  { id: 'noodle', name: 'Noodles', color: '#f5d76e', dark: '#ae9139' },
  { id: 'broth', name: 'Broth', color: '#d35400', dark: '#883500' },
  { id: 'egg', name: 'Egg', color: '#fff3d6', dark: '#bca77e' },
  { id: 'greens', name: 'Greens', color: '#27ae60', dark: '#176a3a' },
];

export const RECIPES = [
  {
    id: 'noodle-bowl',
    name: 'Sunny Noodle Bowl',
    steps: ['noodle', 'broth', 'egg', 'greens'],
    points: 100,
  },
  {
    id: 'burger',
    name: 'Ember Burger',
    steps: ['bun', 'patty', 'cheese', 'lettuce'],
    points: 120,
  },
  {
    id: 'salad',
    name: 'Garden Crunch Salad',
    steps: ['lettuce', 'tomato', 'egg', 'cheese'],
    points: 90,
  },
  {
    id: 'tomato-noodle',
    name: 'Tomato Fire Noodles',
    steps: ['noodle', 'broth', 'tomato', 'greens'],
    points: 110,
  },
];

export const INGREDIENT_BY_ID = Object.fromEntries(
  INGREDIENTS.map((ingredient) => [ingredient.id, ingredient]),
);
export const RECIPE_BY_ID = Object.fromEntries(
  RECIPES.map((recipe) => [recipe.id, recipe]),
);

export const LAYOUT = {
  ticketRect: (index) => ({ x: 40 + index * 305, y: 76, w: 285, h: 112 }),
  binRect: (index) => ({ x: 40 + index * 136, y: 592, w: 124, h: 112 }),
  plateRect: () => ({ x: 400, y: 250, w: 480, h: 300 }),
  serveRect: () => ({ x: 920, y: 330, w: 220, h: 120 }),
  stoveRect: () => ({ x: 62, y: 286, w: 298, h: 242 }),
  potRect: () => ({ x: 1000, y: 462, w: 212, h: 108 }),
};

export const HOTKEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
