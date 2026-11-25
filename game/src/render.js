import { W, H, INGREDIENTS, INGREDIENT_BY_ID, RECIPE_BY_ID, LAYOUT, HOTKEYS, GAME_SECONDS } from './config.js';
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_OVER, nextStepFor } from './world.js';

const FONT = "'Trebuchet MS', 'Segoe UI', Verdana, sans-serif";
const CREAM = '#fff4d9';
const INK = '#41261c';
const GOLD = '#ffc34f';
const GREEN = '#277849';
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

function rr(ctx, x, y, w, h, r) {
  r = clamp(r, 0, Math.min(w, h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function paint(ctx, fill, stroke, width = 2) {
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.lineWidth = width;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

function box(ctx, x, y, w, h, r, fill, stroke, width) {
  rr(ctx, x, y, w, h, r);
  paint(ctx, fill, stroke, width);
}

function oval(ctx, x, y, rx, ry, fill, stroke, width, angle = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2);
  paint(ctx, fill, stroke, width);
}

function path(ctx, build, fill, stroke, width) {
  ctx.beginPath();
  build(ctx);
  paint(ctx, fill, stroke, width);
}

function line(ctx, x1, y1, x2, y2, color, width = 2) {
  path(ctx, p => {
    p.moveTo(x1, y1);
    p.lineTo(x2, y2);
  }, null, color, width);
}

function text(ctx, value, x, y, size, color = INK, align = 'left', weight = 700, maxWidth) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  if (maxWidth === undefined) ctx.fillText(String(value), x, y);
  else ctx.fillText(String(value), x, y, maxWidth);
}

function tick(ctx, x, y, r) {
  oval(ctx, x, y, r, r, '#eef8d9', GREEN, Math.max(1.5, r * 0.21));
  path(ctx, p => {
    p.moveTo(x - r * 0.50, y);
    p.lineTo(x - r * 0.13, y + r * 0.36);
    p.lineTo(x + r * 0.52, y - r * 0.39);
  }, null, GREEN, Math.max(1.5, r * 0.23));
}

function noodleWave(ctx, x, y, w, amp, color, width) {
  path(ctx, p => {
    p.moveTo(x, y);
    for (let i = 0; i < 3; i++) {
      const a = x + i * w / 3;
      p.bezierCurveTo(a + w / 12, y - amp, a + w / 4, y + amp, a + w / 3, y);
    }
  }, null, color, width);
}

function leaf(ctx, x, y, scale, angle, fill, stroke = '#2d552b') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  path(ctx, p => {
    p.moveTo(-20, 1);
    p.bezierCurveTo(-14, -14, 5, -16, 21, -5);
    p.bezierCurveTo(15, 9, -6, 15, -20, 1);
    p.closePath();
  }, fill, stroke, 2.2);
  path(ctx, p => {
    p.moveTo(-14, 1);
    p.quadraticCurveTo(0, 3, 13, -4);
  }, null, stroke, 1.7);
  ctx.restore();
}

function dome(ctx, fill) {
  path(ctx, p => {
    p.moveTo(-26, 6);
    p.bezierCurveTo(-24, -24, 24, -24, 26, 6);
    p.quadraticCurveTo(26, 11, 20, 11);
    p.lineTo(-20, 11);
    p.quadraticCurveTo(-26, 11, -26, 6);
    p.closePath();
  }, fill, '#6f4227', 2.4);
  for (const [x, y, a] of [[-14, -1, -.4], [-6, -9, .5], [3, -4, -.6], [12, -9, .35], [17, 0, .3]]) {
    oval(ctx, x, y, 2.6, 1.2, '#fff0bb', null, 0, a);
  }
}

function egg(ctx, fill) {
  path(ctx, p => {
    p.moveTo(-25, 1);
    p.bezierCurveTo(-27, -10, -15, -21, -5, -18);
    p.bezierCurveTo(5, -16, 10, -23, 19, -16);
    p.bezierCurveTo(29, -11, 25, -2, 27, 6);
    p.bezierCurveTo(29, 16, 10, 21, 2, 17);
    p.bezierCurveTo(-8, 13, -21, 24, -25, 1);
    p.closePath();
  }, fill, '#8b5932', 2.1);
  oval(ctx, 3, 0, 10, 9, '#ffbc2e', '#aa601b', 2);
  oval(ctx, 0, -3, 2.8, 1.7, '#ffe28a');
}

export function drawIngredientIcon(ctx, id, cx, cy, r) {
  const color = INGREDIENT_BY_ID[id]?.color;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(r / 32, r / 32);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  switch (id) {
    case 'bun':
      box(ctx, -23, 9, 46, 9, 4, '#d38a43', '#6f4227', 2.2);
      dome(ctx, color || '#edb468');
      break;
    case 'patty':
      box(ctx, -26, -12, 52, 24, 10, color || '#935232', '#4a281d', 2.5);
      for (let x = -16; x <= 14; x += 10) line(ctx, x, 5, x + 5, -5, '#4a281d', 2.5);
      break;
    case 'cheese':
      path(ctx, p => {
        p.moveTo(-25, 12);
        p.lineTo(-6, -18);
        p.lineTo(26, 9);
        p.lineTo(24, 16);
        p.lineTo(-25, 16);
        p.closePath();
      }, color || '#ffcc45', '#95571d', 2.4);
      for (const [x, y, a] of [[-9, 6, 4], [-4, -6, 2.7], [10, 8, 3.5]]) {
        oval(ctx, x, y, a, a * .8, '#d88b28', '#ad651c', 1.1);
      }
      break;
    case 'lettuce':
      path(ctx, p => {
        p.moveTo(-25, 5);
        p.quadraticCurveTo(-32, -2, -22, -7);
        p.quadraticCurveTo(-25, -17, -12, -16);
        p.quadraticCurveTo(-6, -24, 0, -16);
        p.quadraticCurveTo(11, -25, 16, -13);
        p.quadraticCurveTo(29, -16, 25, -4);
        p.quadraticCurveTo(33, 2, 24, 9);
        p.quadraticCurveTo(20, 19, 10, 14);
        p.quadraticCurveTo(2, 22, -6, 15);
        p.quadraticCurveTo(-18, 21, -25, 5);
        p.closePath();
      }, color || '#75bc48', '#305c2d', 2.2);
      path(ctx, p => {
        p.moveTo(-18, -3);
        p.quadraticCurveTo(-12, -7, -7, 1);
        p.quadraticCurveTo(-2, -7, 5, -1);
        p.quadraticCurveTo(13, -8, 19, -3);
        p.moveTo(-17, 8);
        p.quadraticCurveTo(-8, 4, 0, 9);
        p.quadraticCurveTo(10, 4, 17, 7);
      }, null, '#3b7332', 2.4);
      break;
    case 'tomato':
      oval(ctx, 0, 3, 22, 20, color || '#e75a40', '#842f26', 2.5);
      oval(ctx, -10, -2, 4.5, 2.7, '#ffae8e', null, 0, -.7);
      path(ctx, p => {
        p.moveTo(0, -15);
        p.lineTo(5, -23);
        p.lineTo(7, -16);
        p.lineTo(17, -13);
        p.lineTo(8, -10);
        p.lineTo(8, -5);
        p.lineTo(1, -9);
        p.lineTo(-8, -6);
        p.lineTo(-6, -12);
        p.lineTo(-14, -16);
        p.closePath();
      }, '#4d973d', '#2d5c2b', 1.8);
      break;
    case 'noodles':
    case 'noodle':
      for (const y of [-10, 0, 10]) {
        noodleWave(ctx, -24, y, 48, 5, '#8e5c24', 6.5);
        noodleWave(ctx, -24, y, 48, 5, color || '#ffd45a', 4.1);
      }
      break;
    case 'broth':
      path(ctx, p => {
        p.moveTo(-25, -1);
        p.bezierCurveTo(-22, 25, 22, 25, 25, -1);
        p.closePath();
      }, '#a15e3f', '#633b2d', 2.4);
      oval(ctx, 0, -1, 25, 8.5, color || '#ef9845', '#633b2d', 2.3);
      line(ctx, -10, 1, 7, 1, '#ffcd80', 2.2);
      for (const [x, y] of [[-8, -15], [3, -19], [13, -13]]) {
        oval(ctx, x, y, 2.3, 2.3, '#ffefcf', '#a77651', 1.2);
      }
      break;
    case 'egg':
      egg(ctx, color || '#fff7e3');
      break;
    case 'greens':
      leaf(ctx, -12, 2, .66, .52, color || '#5bad5b');
      leaf(ctx, 11, 3, .69, -.57, color || '#5bad5b');
      leaf(ctx, 0, -5, .73, -1.35, color || '#5bad5b');
      break;
    default:
      oval(ctx, 0, 0, 18, 18, color || '#cd995f', INK, 2);
  }

  ctx.restore();
}

function kitchen(ctx) {
  ctx.fillStyle = '#f7e8d0';
  ctx.fillRect(-10, -10, W + 20, H + 20);

  ctx.fillStyle = '#77b5a9';
  ctx.fillRect(-10, 136, W + 20, 84);
  for (let y = 136; y <= 220; y += 28) line(ctx, -10, y, W + 10, y, '#477f78', 2);
  for (let row = 0; row < 3; row++) {
    for (let x = row % 2 ? 22 : 0; x < W; x += 44) {
      line(ctx, x, 136 + row * 28, x, 164 + row * 28, '#477f78', 2);
    }
  }

  const wx = W - 270;
  box(ctx, wx, 66, 248, 150, 12, '#af7547', '#6b432d', 4);
  ctx.save();
  rr(ctx, wx + 9, 75, 230, 132, 5);
  ctx.clip();
  ctx.fillStyle = '#a5ddec';
  ctx.fillRect(wx, 75, 248, 135);
  oval(ctx, wx + 181, 156, 32, 32, '#ffce58');
  oval(ctx, wx + 158, 230, 114, 65, '#8fbf7b');
  oval(ctx, wx + 56, 234, 126, 63, '#579b70');
  line(ctx, wx + 125, 75, wx + 125, 207, '#f8deb0', 7);
  ctx.restore();
  box(ctx, wx - 4, 203, 256, 10, 4, '#d5a26a', '#74472c', 3);

  box(ctx, 42, 191, 287, 14, 4, '#b77a46', '#6b432d', 4);
  const jars = ['#d9694c', '#e4aa55', '#7d9f53'];
  jars.forEach((color, i) => {
    const x = 64 + i * 81;
    box(ctx, x, 147 - i * 4, 47, 45 + i * 4, 8, color, '#6b432d', 3);
    box(ctx, x + 8, 171, 31, 14, 3, '#f8dcac');
    box(ctx, x - 2, 139 - i * 4, 51, 12, 3, '#663e29', '#46291f', 2);
  });

  line(ctx, 356, 115, 628, 115, '#6b4936', 6);
  for (let i = 0; i < 3; i++) {
    const x = 391 + i * 98;
    const y = 175 + (i % 2) * 7;
    box(ctx, x - 5, 116, 10, y - 117, 4, '#744735', '#583527', 2);
    oval(ctx, x, y, 22 + i * 3, 22 + i * 3, '#c77a4d', '#724432', 4);
    oval(ctx, x, y, 15 + i * 3, 15 + i * 3, '#e49866', '#a95c3f', 2);
  }

  ctx.fillStyle = '#b07a45';
  ctx.fillRect(-10, 210, W + 20, 370);
  ctx.fillStyle = '#bc8751';
  ctx.fillRect(-10, 213, W + 20, 25);
  for (const [y, seam] of [[239, 265], [303, 860], [372, 350], [449, 1050], [518, 568]]) {
    line(ctx, -10, y, W + 10, y, '#986437', 2);
    line(ctx, seam, y - 28, seam, y, '#986437', 2);
  }
  ctx.fillStyle = '#8e542f';
  ctx.fillRect(-10, 540, W + 20, 40);
  line(ctx, -10, 541, W + 10, 541, '#5a3425', 5);
  line(ctx, -10, 549, W + 10, 549, '#bf8450', 3);

  ctx.fillStyle = '#ca935e';
  ctx.fillRect(-10, 580, W + 20, H - 570);
  line(ctx, -10, 581, W + 10, 581, '#5c3827', 5);
  for (let y = 616; y < H; y += 36) {
    line(ctx, -10, y, W + 10, y, '#a36b44', 2);
    for (let x = (y % 72 ? 96 : 0); x < W; x += 192) {
      line(ctx, x, y, x, Math.min(y + 36, H + 10), '#a36b44', 2);
    }
  }
}

function flame(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  path(ctx, p => {
    p.moveTo(0, -23);
    p.bezierCurveTo(1, -11, 16, -12, 16, 4);
    p.bezierCurveTo(16, 24, -16, 24, -16, 6);
    p.quadraticCurveTo(-16, -2, -8, -10);
    p.quadraticCurveTo(-9, -1, -4, -3);
    p.quadraticCurveTo(1, -12, 0, -23);
    p.closePath();
  }, '#ff9947', '#55271f', 2);
  path(ctx, p => {
    p.moveTo(1, -1);
    p.quadraticCurveTo(17, 17, 1, 17);
    p.quadraticCurveTo(-12, 16, 1, -1);
    p.closePath();
  }, '#ffe28a');
  ctx.restore();
}

function hud(ctx, world, opts, t) {
  ctx.fillStyle = '#7a2e1d';
  ctx.fillRect(-10, -10, W + 20, 74);
  line(ctx, -10, 63, W + 10, 63, '#45241c', 4);
  flame(ctx, 36, 33, .8);
  text(ctx, 'EMBER KITCHEN RUSH', 62, 33, 28, CREAM, 'left', 800);

  const remaining = Number.isFinite(world.timeLeft) ? world.timeLeft : GAME_SECONDS;
  const seconds = Math.max(0, Math.ceil(remaining));
  const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const hurry = world.screen === SCREEN_PLAY && remaining < 20;
  const scale = hurry ? 1 + Math.sin(t * 10) * .065 : 1;
  ctx.save();
  ctx.translate(W / 2, 32);
  ctx.scale(scale, scale);
  box(ctx, -70, -23, 140, 46, 23, hurry ? '#b82029' : CREAM, hurry ? '#ffa08b' : '#d69a61', 3);
  text(ctx, clock, 0, 1, 34, hurry ? '#fff4e6' : INK, 'center', 800);
  ctx.restore();

  const scoreX = W - 152;
  text(ctx, `SCORE ${world.score}`, scoreX, world.combo >= 2 ? 19 : 33, 25, CREAM, 'right', 800);
  if (world.combo >= 2) {
    box(ctx, scoreX - 131, 32, 131, 24, 12, GOLD, '#542c1a', 2);
    text(ctx, `COMBO x${world.combo}`, scoreX - 65.5, 44, 15, INK, 'center', 800, 117);
  }
  text(ctx, `M: sound ${opts.muted ? 'off' : 'on'}`, W - 15, 15, 11, CREAM, 'right');
}

const stepId = step => typeof step === 'object' && step !== null ? (step.ingredientId ?? step.id) : step;
const ingredientName = id => INGREDIENT_BY_ID[id]?.name ?? INGREDIENT_BY_ID[id]?.label ?? id;
const recipeName = (recipe, fallback) => recipe?.name ?? recipe?.label ?? fallback;

function orderBoard(ctx, world) {
  box(ctx, 40, 76, W - 80, 112, 13, '#5d3729', '#382219', 4);
  const slots = Math.max(4, world.orders.length);
  for (let i = 0; i < slots; i++) {
    const rect = LAYOUT.ticketRect(i);
    const order = world.orders[i];
    const selected = !!order && order.id === world.selectedId;
    const x = rect.x + 4;
    const y = rect.y + 4 - (selected ? 4 : 0);
    const w = rect.w - 8;
    const h = rect.h - 8;
    if (!order) {
      ctx.save();
      ctx.setLineDash([7, 6]);
      box(ctx, x + 3, y + 3, w - 6, h - 6, 10, '#684333', '#a77d5e', 2);
      ctx.restore();
      text(ctx, 'waiting for orders...', x + w / 2, y + h / 2, 16, '#d8b497', 'center');
      continue;
    }

    const recipe = RECIPE_BY_ID[order.recipeId];
    const steps = recipe?.steps ?? [];
    box(ctx, x, y + 3, w, h, 10, '#3e251c');
    box(ctx, x, y, w, h, 10, selected ? '#fff8df' : '#f3e2bf', selected ? GOLD : '#876147', selected ? 5 : 2.5);
    text(ctx, recipeName(recipe, order.recipeId), x + 13, y + 21, 22, INK, 'left', 800, w - (selected ? 107 : 26));
    if (selected) {
      box(ctx, x + w - 87, y + 9, 76, 20, 7, GOLD, '#a86623', 1.5);
      text(ctx, 'COOKING', x + w - 49, y + 19, 12, INK, 'center', 800);
    }

    const ratio = order.total > 0 ? clamp(order.timeLeft / order.total, 0, 1) : 0;
    const barW = w - 62;
    box(ctx, x + 13, y + 39, barW, 10, 5, '#b89d7b');
    if (ratio > 0) {
      box(ctx, x + 13, y + 39, barW * ratio, 10, 5,
        ratio > .5 ? '#39844b' : ratio > .25 ? '#ca841f' : '#bf3d3a');
    }
    text(ctx, `${Math.max(0, Math.ceil(order.timeLeft))}s`, x + w - 11, y + 44, 16, INK, 'right');

    const spacing = Math.min(47, (w - 27) / Math.max(1, steps.length));
    const r = Math.min(19, spacing * .42);
    steps.forEach((step, index) => {
      const id = stepId(step);
      const ix = x + 13 + spacing * (index + .5);
      const iy = y + 76;
      const done = selected && world.assembly[index] === id;
      oval(ctx, ix, iy, r + 2, r + 2, done ? '#e2edcb' : '#e9d4ae', done ? GREEN : '#c1a37b', done ? 2.6 : 1.6);
      drawIngredientIcon(ctx, id, ix, iy, r - 1);
      if (done) tick(ctx, ix + r * .76, iy + r * .72, 7);
    });
  }

  ctx.save();
  ctx.translate(29, 132);
  ctx.rotate(-Math.PI / 2);
  box(ctx, -53, -10, 106, 20, 5, '#e7b36b', '#714a36', 2);
  text(ctx, 'ORDER BOARD', 0, 1, 12, INK, 'center', 800);
  ctx.restore();
}

function stove(ctx, t) {
  const { x, y, w, h } = LAYOUT.stoveRect();
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.scale(w / 280, h / 220);

  box(ctx, -137, -47, 274, 150, 15, '#68422e');
  box(ctx, -137, -54, 274, 150, 15, '#4b4541', '#302824', 5);
  box(ctx, -137, 57, 274, 39, 9, '#605651', '#302824', 4);
  for (const bx of [-66, 65]) {
    oval(ctx, bx, 12, 54, 34, '#302b2a', '#76706a', 3);
    oval(ctx, bx, 12, 41, 24, null, '#af5e3f', 3);
    oval(ctx, bx, 12, 27, 15, null, '#8c523e', 2);
  }
  for (const bx of [-89, -51, 51, 89]) {
    oval(ctx, bx, 76, 9, 9, '#272322', '#a59786', 2);
    line(ctx, bx, 70, bx, 75, '#fae6bf', 2);
  }
  oval(ctx, 0, 76, 4, 4, '#ff9c53');

  box(ctx, 77, -14, 55, 13, 6, '#6a4230', '#272322', 3);
  oval(ctx, 58, 1, 43, 25, '#262526', '#191818', 4);
  oval(ctx, 58, -1, 34, 17, '#454243', '#1e1b1b', 2);
  line(ctx, 40, 4, 62, 7, '#6c6460', 2.5);

  box(ctx, -128, -33, 124, 13, 5, '#664132', '#392c27', 3);
  path(ctx, p => {
    p.moveTo(-113, -33);
    p.lineTo(-103, 14);
    p.quadraticCurveTo(-67, 40, -30, 14);
    p.lineTo(-18, -33);
    p.closePath();
  }, '#bf7048', '#492f28', 4);
  oval(ctx, -66, -33, 48, 20, '#dd9a68', '#492f28', 4);
  oval(ctx, -66, -33, 41, 13, '#ef953f', '#934527', 2.5);
  for (let i = 0; i < 4; i++) {
    oval(ctx, -89 + i * 15, -34 + Math.sin(t * 4 + i * 2) * 5, 3.4, 2, '#ffd488', '#c96a30', 1.4);
  }
  for (let i = 0; i < 3; i++) {
    const sx = -89 + i * 22;
    const sy = -54 - (i % 2) * 8;
    const sway = Math.sin(t * 3.4 + i * 2) * 9;
    const curl = p => {
      p.moveTo(sx, sy);
      p.bezierCurveTo(sx - 14 + sway, sy - 12, sx + 16 + sway, sy - 19, sx + sway, sy - 35);
    };
    path(ctx, curl, null, '#5d5148', 5.5);
    path(ctx, curl, null, '#fff2d5', 3);
  }
  ctx.restore();
}

function dishLayer(ctx, id, cx, cy, scale, index, count) {
  const color = INGREDIENT_BY_ID[id]?.color;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  switch (id) {
    case 'broth':
      path(ctx, p => {
        p.moveTo(-111, 0);
        p.bezierCurveTo(-103, 72, 103, 72, 111, 0);
        p.closePath();
      }, '#a96546', '#653d2c', 4);
      oval(ctx, 0, 0, 111, 33, '#d89260', '#653d2c', 4);
      oval(ctx, 0, -2, 101, 25, color || '#ed9340', '#a6552c', 3);
      path(ctx, p => {
        p.moveTo(-75, -6);
        p.quadraticCurveTo(-52, -17, -23, -15);
        p.moveTo(47, 12);
        p.quadraticCurveTo(68, 9, 77, 4);
      }, null, '#ffcc80', 3);
      break;
    case 'noodle':
    case 'noodles':
      path(ctx, p => {
        p.moveTo(-100, 4);
        p.bezierCurveTo(-109, -38, 88, -47, 99, 0);
        p.bezierCurveTo(115, 30, -97, 34, -100, 4);
        p.closePath();
      }, color || '#ffd465', '#9a5e25', 4);
      for (const [y, w] of [[-17, 127], [-6, 161], [5, 174], [16, 144]]) {
        noodleWave(ctx, -w / 2, y, w, 10, '#b77728', 5);
        noodleWave(ctx, -w / 2, y - 1, w, 10, '#ffe29a', 2.6);
      }
      break;
    case 'egg':
      ctx.translate(12, 0);
      ctx.rotate(-.16);
      ctx.scale(2.6, 1.7);
      egg(ctx, color || '#fff8eb');
      break;
    case 'lettuce':
    case 'greens': {
      const fill = color || (id === 'greens' ? '#5bab54' : '#79bc47');
      for (const [x, y, s, a] of [[-67, 2, 1.64, .23], [-27, -8, 1.65, -.28], [38, -7, 1.55, .18], [70, 1, 1.5, -.28], [8, 8, 1.72, -.13]]) {
        leaf(ctx, x, y, s, a, fill);
      }
      break;
    }
    case 'bun':
      if (index === 0 || index < count - 1) {
        box(ctx, -97, -14, 194, 38, 17, color || '#e7ac67', '#744427', 4);
        oval(ctx, 0, -9, 91, 15, '#f5cb8b', '#a36c3c', 2.5);
      } else {
        ctx.translate(0, -10);
        ctx.scale(3.65, 2.28);
        dome(ctx, color || '#eab16b');
      }
      break;
    case 'patty':
      box(ctx, -101, -21, 202, 40, 19, color || '#905035', '#502a20', 4);
      for (let x = -70; x <= 66; x += 23) line(ctx, x, 6, x + 15, -9, '#512c22', 4);
      break;
    case 'cheese':
      path(ctx, p => {
        p.moveTo(-96, -8);
        p.lineTo(-21, -30);
        p.lineTo(100, -1);
        p.lineTo(36, 23);
        p.lineTo(4, 15);
        p.lineTo(-23, 26);
        p.closePath();
      }, color || '#ffca47', '#a66820', 3.5);
      oval(ctx, -22, -5, 7, 3.5, '#db9228');
      oval(ctx, 38, 0, 5, 3, '#db9228');
      break;
    case 'tomato':
      for (const [x, y] of [[-50, 2], [45, -5], [1, 7]]) {
        oval(ctx, x, y + 5, 42, 17, '#ac3c30', '#782c25', 3);
        oval(ctx, x, y, 42, 17, color || '#e95840', '#782c25', 3);
        oval(ctx, x, y, 26, 10, '#f98560', '#bd4936', 2);
        for (const dx of [-13, 0, 13]) oval(ctx, x + dx, y + (dx ? 2 : -3), 2.2, 1.4, '#ffe2a1');
      }
      break;
    default:
      drawIngredientIcon(ctx, id, 0, 0, 37);
  }
  ctx.restore();
}

function plate(ctx, world, t) {
  const { x, y, w, h } = LAYOUT.plateRect();
  const cx = x + w / 2;
  const cy = y + h * .57;
  const rx = w * .395;
  const ry = h * .285;

  box(ctx, x + 16, y + 58, w - 32, h - 71, 23, '#765032', '#69422a', 4);
  box(ctx, x + 16, y + 52, w - 32, h - 71, 23, '#d5a171', '#69422a', 4);
  for (const offset of [76, 121, 214, 260]) {
    line(ctx, x + 34, y + offset, x + w - 34, y + offset, '#ba865a', 2);
  }
  if (world.dishReady) {
    const pulse = (1 + Math.sin(t * 7)) / 2;
    oval(ctx, cx, cy + 3, rx + 17 + pulse * 5, ry + 15 + pulse * 3, '#ffdf76', '#b36a27', 3);
    oval(ctx, cx, cy + 3, rx + 9, ry + 8, null, '#fff0ae', 5);
  }
  oval(ctx, cx, cy + 8, rx, ry, '#beae97', INK, 4);
  oval(ctx, cx, cy, rx, ry, '#fffdf2', INK, 4);
  oval(ctx, cx, cy, rx * .79, ry * .73, '#f7ebd6', '#cfbda4', 3);

  if (!world.assembly.length) {
    ctx.save();
    ctx.setLineDash([7, 7]);
    oval(ctx, cx, cy, rx * .70, ry * .56, null, '#b4a38b', 2);
    ctx.restore();
    text(ctx, 'Click ingredients below in recipe order', cx, cy, 17, '#6e5847', 'center', 700, rx * 1.36);
  } else {
    oval(ctx, cx, cy + 25, rx * .57, ry * .36, '#dcc7aa');
    world.assembly.forEach((id, i) => {
      const lift = Math.min(i * 14, 57);
      dishLayer(ctx, id, cx, cy + 12 - lift, 1 - Math.min(i, 5) * .024, i, world.assembly.length);
    });
  }
  if (world.dishReady) {
    box(ctx, cx - 143, y + 8, 286, 38, 12, '#ffce54', '#794721', 4);
    text(ctx, 'READY TO SERVE!', cx, y + 28, 23, INK, 'center', 800);
  }
}

function chef(ctx) {
  const anchor = LAYOUT.potRect();
  const x = clamp(anchor.x + anchor.w / 2, W - 132, W - 110);
  const y = clamp(anchor.y + anchor.h * .25, 269, 283);
  ctx.save();
  ctx.translate(x, y);

  box(ctx, -55, 26, 110, 132, 32, '#fff0d5', '#674434', 4);
  ctx.save();
  rr(ctx, -41, 50, 82, 104, 13);
  ctx.clip();
  ctx.fillStyle = '#e8f0da';
  ctx.fillRect(-41, 50, 82, 104);
  for (let i = -33; i < 42; i += 16) {
    ctx.fillStyle = '#57968a';
    ctx.fillRect(i, 50, 8, 104);
  }
  ctx.restore();
  box(ctx, -41, 50, 82, 104, 13, null, '#435f56', 3);
  box(ctx, -27, 108, 54, 24, 6, '#b5d5c6', '#435f56', 3);

  path(ctx, p => {
    p.moveTo(-23, 25);
    p.lineTo(25, 25);
    p.lineTo(0, 49);
    p.closePath();
  }, '#c64b41', '#7b312b', 3);
  oval(ctx, 0, 37, 8, 5, '#e36e52', '#7b312b', 2);

  oval(ctx, -35, 4, 8, 10, '#dda078', '#684134', 3);
  oval(ctx, 35, 4, 8, 10, '#dda078', '#684134', 3);
  oval(ctx, 0, 0, 36, 33, '#f0b990', '#684134', 4);
  oval(ctx, -12, -1, 3.2, 4, INK);
  oval(ctx, 12, -1, 3.2, 4, INK);
  oval(ctx, -20, 9, 5, 3, '#dc907a');
  oval(ctx, 20, 9, 5, 3, '#dc907a');
  path(ctx, p => {
    p.moveTo(-10, 11);
    p.quadraticCurveTo(0, 25, 10, 11);
  }, null, '#813e32', 3);

  path(ctx, p => {
    p.moveTo(-29, -20);
    p.lineTo(-31, -35);
    p.bezierCurveTo(-58, -47, -30, -72, -14, -55);
    p.bezierCurveTo(-9, -76, 19, -74, 23, -55);
    p.bezierCurveTo(44, -68, 60, -42, 33, -34);
    p.lineTo(29, -20);
    p.closePath();
  }, '#fffbec', '#674434', 4);
  box(ctx, -31, -30, 62, 13, 4, '#f1e0bf', '#674434', 3);

  path(ctx, p => {
    p.moveTo(44, 49);
    p.quadraticCurveTo(69, 64, 74, 33);
  }, null, '#674434', 24);
  path(ctx, p => {
    p.moveTo(44, 49);
    p.quadraticCurveTo(69, 64, 74, 33);
  }, null, '#fff0d5', 17);
  line(ctx, 70, 52, 89, -17, '#633d2a', 10);
  line(ctx, 70, 52, 89, -17, '#c68b50', 6);
  oval(ctx, 90, -22, 11, 16, '#cb9157', '#633d2a', 3, .27);
  oval(ctx, 76, 31, 10, 9, '#f0b990', '#684134', 3);
  ctx.restore();
}

function serveButton(ctx, world, t) {
  const { x, y, w, h } = LAYOUT.serveRect();
  const ready = world.dishReady;
  if (ready) {
    const halo = 5 + (1 + Math.sin(t * 7)) * 2.5;
    ctx.save();
    ctx.globalAlpha = .65;
    box(ctx, x - halo, y - halo, w + 2 * halo, h + 2 * halo + 4, 22, '#ffdf75');
    ctx.restore();
  }

  box(ctx, x, y + 6, w, h, 20, ready ? '#1f5638' : '#4b4843', INK, 4);
  box(ctx, x, y, w, h, 20, ready ? '#238748' : '#686860', INK, 4);
  line(ctx, x + 23, y + 12, x + w - 23, y + 12, ready ? '#91d78d' : '#98978b', 4);
  text(ctx, 'SERVE', x + w / 2, y + h * .40, 36, ready ? '#fff9e9' : '#f2ead9', 'center', 800);
  box(ctx, x + w / 2 - 31, y + h * .62, 62, 23, 7, ready ? '#185933' : '#4d4e47');
  text(ctx, 'Enter', x + w / 2, y + h * .62 + 12, 14, CREAM, 'center', 800);
}

function ingredientBins(ctx, world, t) {
  const next = world.screen === SCREEN_PLAY ? stepId(nextStepFor(world)) : undefined;
  INGREDIENTS.forEach((ingredient, i) => {
    const { x, y, w, h } = LAYOUT.binRect(i);
    const needed = ingredient.id === next;
    const used = world.assembly.includes(ingredient.id);
    if (needed) {
      const spread = 4 + (1 + Math.sin(t * 8)) * 1.8;
      box(ctx, x - spread, y - spread, w + spread * 2, h + spread * 2, 15, '#ffde83');
    }
    box(ctx, x, y + 4, w, h, 12, '#7f4f32', '#583525', 3);
    box(ctx, x, y, w, h, 12, '#d6a371', needed ? '#f8bf38' : '#633d29', needed ? 5 : 3);
    box(ctx, x + 7, y + 7, w - 14, h - 32, 8, '#eed0a2', '#ab744a', 2);
    drawIngredientIcon(ctx, ingredient.id, x + w / 2, y + h * .43, 31);
    text(ctx, ingredientName(ingredient.id), x + w / 2, y + h - 13, 17, INK, 'center', 800, w - 13);

    oval(ctx, x + 17, y + 17, 12, 12, INK, '#e6bd8b', 2);
    text(ctx, HOTKEYS[i], x + 17, y + 17, 14, CREAM, 'center', 800);
    if (used) tick(ctx, x + w - 17, y + 17, 9);
    if (needed) {
      box(ctx, x + w / 2 - 29, y - 16, 58, 21, 8, GOLD, '#784823', 2);
      text(ctx, 'NEXT', x + w / 2, y - 5, 13, INK, 'center', 800);
    }
  });
}

function toast(ctx, message) {
  if (!message?.text) return;
  ctx.font = `700 19px ${FONT}`;
  const w = clamp(ctx.measureText(message.text).width + 38, 110, W - 100);
  box(ctx, (W - w) / 2, 212, w, 36, 18, '#4d2d24', '#edbb74', 2);
  text(ctx, message.text, W / 2, 230, 19, CREAM, 'center', 700, w - 28);
}

function panel(ctx, w, h) {
  const x = (W - w) / 2;
  const y = (H - h) / 2;
  ctx.fillStyle = 'rgba(40,20,10,0.55)';
  ctx.fillRect(0, 0, W, H);
  box(ctx, x, y + 9, w, h, 26, '#46281d');
  box(ctx, x, y, w, h, 26, CREAM, '#603723', 5);
  box(ctx, x + 9, y + 9, w - 18, h - 18, 19, null, '#d9aa73', 2);
  return { x, y, w, h, cx: W / 2 };
}

function titleScreen(ctx, opts, t) {
  const p = panel(ctx, 818, 560);
  flame(ctx, p.cx, p.y + 41, 1.04);
  text(ctx, 'EMBER KITCHEN RUSH', p.cx, p.y + 88, 52, '#78301f', 'center', 800, p.w - 55);
  text(ctx, 'A tiny timed cooking rush', p.cx, p.y + 127, 22, '#6a4b36', 'center');
  line(ctx, p.x + 52, p.y + 151, p.x + p.w - 52, p.y + 151, '#d6ac78', 2);

  const howTo = [
    '1. Click an order ticket to pick it.',
    '2. Click ingredients in the recipe order.',
    '3. SERVE before the ticket timer runs out.',
    'Wrong ingredient: -3 seconds!'
  ];
  howTo.forEach((s, i) => {
    text(ctx, s, p.cx, p.y + 173 + i * 26, 19, i === 3 ? '#a13326' : INK, 'center', 700);
  });

  box(ctx, p.x + 46, p.y + 270, p.w - 92, 144, 13, '#f5dfba', '#d6ac78', 2);
  Object.values(RECIPE_BY_ID).slice(0, 4).forEach((recipe, i) => {
    const y = p.y + 292 + i * 33;
    if (i) line(ctx, p.x + 63, y - 16, p.x + p.w - 63, y - 16, '#dfbb8b', 1.5);
    text(ctx, recipeName(recipe, recipe.id), p.x + 66, y, 18, '#78301f', 'left', 800, 201);
    const steps = (recipe.steps ?? []).map(step => ingredientName(stepId(step))).join(' > ');
    text(ctx, steps, p.x + 284, y, 16, INK, 'left', 700, p.w - 349);
  });

  text(ctx, `Best score: ${opts.best ?? 0}`, p.cx, p.y + 447, 22, INK, 'center', 800);
  ctx.save();
  const pulse = 1 + Math.sin(t * 5) * .028;
  ctx.translate(p.cx, p.y + 504);
  ctx.scale(pulse, pulse);
  box(ctx, -229, -24, 458, 48, 15, '#7a2e1d', '#542d20', 3);
  text(ctx, 'CLICK OR PRESS ENTER TO START', 0, 1, 23, CREAM, 'center', 800, 420);
  ctx.restore();
}

function overScreen(ctx, world, opts) {
  const p = panel(ctx, 620, 468);
  text(ctx, "TIME'S UP!", p.cx, p.y + 54, 44, '#78301f', 'center', 800);
  text(ctx, `Score: ${world.score}`, p.cx, p.y + 123, 62, INK, 'center', 800, p.w - 62);
  line(ctx, p.x + 58, p.y + 166, p.x + p.w - 58, p.y + 166, '#d6ac78', 2);

  const rows = [
    ['Dishes served:', world.served],
    ['Orders missed:', world.missed],
    ['Best combo:', `x${world.bestCombo}`],
    ['Best score:', opts.best ?? 0]
  ];
  rows.forEach(([label, value], i) => {
    const y = p.y + 198 + i * 43;
    box(ctx, p.x + 76, y - 16, p.w - 152, 34, 7, i % 2 ? '#f9e9cb' : '#f1dfbb');
    text(ctx, label, p.x + 92, y + 1, 21);
    text(ctx, value, p.x + p.w - 92, y + 1, 21, INK, 'right', 800);
  });

  box(ctx, p.cx - 218, p.y + 382, 436, 52, 15, '#7a2e1d', '#542d20', 3);
  text(ctx, 'Press R or click to play again', p.cx, p.y + 409, 22, CREAM, 'center', 800);
}

export function draw(ctx, world, opts = { best: 0, muted: false }) {
  const t = world.elapsed || 0;
  const shake = clamp(world.shake || 0, 0, 1) * 8;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.save();
  ctx.translate(shake * Math.sin(t * 50), shake * Math.cos(t * 53));
  kitchen(ctx);
  hud(ctx, world, opts, t);
  orderBoard(ctx, world);
  stove(ctx, t);
  plate(ctx, world, t);
  chef(ctx);
  serveButton(ctx, world, t);
  ingredientBins(ctx, world, t);
  toast(ctx, world.message);
  ctx.restore();

  if (world.flash > 0) {
    ctx.fillStyle = `rgba(255,201,65,${clamp(world.flash, 0, 1) * .25})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (world.screen === SCREEN_TITLE) titleScreen(ctx, opts, t);
  else if (world.screen === SCREEN_OVER) overScreen(ctx, world, opts);
  ctx.restore();
}
