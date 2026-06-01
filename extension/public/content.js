// --- 1. STATE MANAGEMENT ---
let currentTool = 'cursor';
let currentColor = '#ff6b00';
let isMenuOpen = true;
let isEraserOpen = false;
let actionHistory = [];
let redoHistory = [];

// --- 2. INJECT ULTRA-MODERN BOLD CSS ---
const style = document.createElement('style');
style.textContent = `
  #ws-wrapper { position: fixed; top: 15px; right: 15px; z-index: 999999; font-family: 'Segoe UI', system-ui, sans-serif; user-select: none; }
  .ws-main-toggle { background: #000000; border: 3px solid #000000; border-radius: 30px; padding: 8px 14px; cursor: move; font-weight: bold; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); color: #ffffff; display: flex; align-items: center; justify-content: center; gap: 6px; transition: transform 0.1s, background-color 0.2s; }
  .ws-main-toggle:hover { background: #18181b; border-color: #ff6b00; }
  #ws-menu { background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(10px); border: 3px solid #000000; border-radius: 14px; padding: 6px; margin-top: 8px; display: flex; flex-direction: column; gap: 2px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); width: 125px; transition: opacity 0.2s; }
  .ws-menu-hidden { display: none !important; }
  .ws-btn { background: transparent; border: none; padding: 4px 8px; text-align: left; cursor: pointer; border-radius: 6px; font-size: 12px; color: #111827; display: flex; align-items: center; gap: 6px; font-weight: bold; transition: background 0.2s, transform 0.1s; width: 100%; }
  .ws-btn:hover { background: #f3f4f6; }
  .ws-btn.ws-active { background: #ff6b00; color: #ffffff; box-shadow: 0 2px 6px rgba(255, 107, 0, 0.4); }

  /* Sub-menu Collapsible Dropdown Containers - Opens below inside the menu itself */
  .ws-eraser-container, .ws-shape-container, .ws-laser-container {
    display: none;
    flex-direction: column;
    gap: 2px;
    margin: 1px 4px;
    padding: 2px;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .ws-eraser-container.ws-show, .ws-shape-container.ws-show, .ws-laser-container.ws-show {
    display: flex;
    animation: wsFadeSlideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  /* Keyframe animations for slide/fade of sub-menus */
  @keyframes wsFadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(-4px) scaleY(0.95);
      max-height: 0;
    }
    to {
      opacity: 1;
      transform: translateY(0) scaleY(1);
      max-height: 150px;
    }
  }

  /* Premium interactive styling and micro-animations for sub-buttons */
  .ws-eraser-container .ws-btn, .ws-shape-container .ws-btn, .ws-laser-container .ws-btn {
    font-size: 11.5px;
    padding: 3px 6px;
    border-radius: 5px;
    transition: transform 0.15s ease, background 0.2s ease, color 0.2s ease;
  }
  .ws-eraser-container .ws-btn:hover, .ws-shape-container .ws-btn:hover, .ws-laser-container .ws-btn:hover {
    transform: translateX(3px);
    background: rgba(0, 0, 0, 0.05);
  }
  .ws-eraser-container .ws-btn.ws-active, .ws-shape-container .ws-btn.ws-active, .ws-laser-container .ws-btn.ws-active {
    transform: translateX(3px);
    background: #ff6b00;
    color: #ffffff;
    box-shadow: 0 2px 6px rgba(255, 107, 0, 0.3);
  }
  .ws-divider { height: 2px; background: #000000; margin: 2px 0; }
  .ws-laser-cursor { cursor: crosshair !important; }
  .ws-color-section { display: flex; flex-direction: column; gap: 6px; padding: 4px; font-size: 12px; font-weight: bold; color: #111827; }
  .ws-custom-row { display: flex; align-items: center; justify-content: space-between; }
  .ws-color-row { display: flex; gap: 6px; justify-content: space-between; margin-top: 2px; }
  .ws-color-swatch { width: 16px; height: 16px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: transform 0.1s; }
  .ws-color-swatch:hover { transform: scale(1.2); }
  .ws-color-swatch.ws-active-color { border-color: #ff6b00; transform: scale(1.2); }
  .ws-color-picker { width: 18px; height: 18px; padding: 0; border: none; border-radius: 50%; cursor: pointer; background: transparent; }
  .ws-color-picker::-webkit-color-swatch { border-radius: 50%; border: 2px solid #000000; }
  
  /* --- CUSTOM MODAL STYLES --- */
  .ws-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); backdrop-filter: blur(3px); z-index: 9999999; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.2s ease; }
  .ws-modal-overlay.ws-show { opacity: 1; pointer-events: auto; }
  .ws-modal { background: #ffffff; border: 3px solid #000000; border-radius: 16px; padding: 24px; box-shadow: 8px 8px 0 rgba(0,0,0,0.2); text-align: center; max-width: 320px; transform: translateY(20px); transition: transform 0.2s ease; font-family: 'Segoe UI', system-ui, sans-serif; }
  .ws-modal-overlay.ws-show .ws-modal { transform: translateY(0); }
  .ws-modal-title { margin: 0 0 10px 0; font-size: 20px; font-weight: bold; color: #000000; }
  .ws-modal-text { margin: 0 0 24px 0; font-size: 14px; color: #4b5563; line-height: 1.4; }
  .ws-modal-actions { display: flex; gap: 12px; justify-content: center; }
  .ws-modal-btn { padding: 10px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; border: 2px solid #000000; transition: all 0.1s; }
  .ws-btn-cancel { background: #ffffff; color: #000000; }
  .ws-btn-cancel:hover { background: #f3f4f6; }
  .ws-btn-confirm { background: #ff6b00; color: #ffffff; border-color: #ff6b00; }
  .ws-btn-confirm:hover { background: #e05e00; border-color: #e05e00; box-shadow: 2px 2px 0 #000000; transform: translate(-2px, -2px); }

  /* --- DOM STYLES --- */
  .ws-highlight { border-radius: 3px; padding: 0 2px; transition: background 0.2s; }
  .ws-sticky-note { 
    position: absolute; width: 220px; background: #ffffff; 
    border: 3px solid #000000; box-shadow: 4px 4px 0px rgba(0,0,0,0.2); 
    border-radius: 12px; z-index: 999997; display: flex; flex-direction: column; 
    overflow: hidden; resize: both; min-width: 150px; min-height: 100px;
  }
  .ws-note-header { 
    height: 28px; cursor: move; display: flex; justify-content: flex-end; 
    align-items: center; padding: 0 10px; border-bottom: 3px solid #000000; flex-shrink: 0;
  }
  .ws-note-close { cursor: pointer; font-size: 16px; font-weight: bold; color: #000; background: rgba(255,255,255,0.7); border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
  .ws-note-close:hover { background: rgba(255,255,255,1); }
  .ws-note-body { 
    width: 100%; border: none; background: #fafafa; padding: 10px; 
    font-family: 'Segoe UI', system-ui, sans-serif; font-size: 14px; 
    outline: none; box-sizing: border-box; color: #111827; flex-grow: 1; 
    resize: none !important; overflow-y: auto;
  }
`;
document.head.appendChild(style);

// --- 3. BUILD DOM & MODAL STRUCTURE ---
const wrapper = document.createElement('div');
wrapper.id = 'ws-wrapper';

const toggleBtn = document.createElement('button');
toggleBtn.className = 'ws-main-toggle';
toggleBtn.innerHTML = '✏️ WebScribe';
wrapper.appendChild(toggleBtn);

const menu = document.createElement('div');
menu.id = 'ws-menu';
wrapper.appendChild(menu);

// Custom Modal Setup
const modalOverlay = document.createElement('div');
modalOverlay.className = 'ws-modal-overlay';
modalOverlay.innerHTML = `
  <div class="ws-modal">
    <h3 class="ws-modal-title">Clear Everything?</h3>
    <p class="ws-modal-text">This will permanently delete all notes, highlights, and drawings. You cannot undo this action.</p>
    <div class="ws-modal-actions">
      <button class="ws-modal-btn ws-btn-cancel" id="ws-cancel-clear">Cancel</button>
      <button class="ws-modal-btn ws-btn-confirm" id="ws-confirm-clear">Yes, clear it</button>
    </div>
  </div>
`;
document.body.appendChild(modalOverlay);

document.getElementById('ws-cancel-clear').addEventListener('click', () => {
  modalOverlay.classList.remove('ws-show');
});
document.getElementById('ws-confirm-clear').addEventListener('click', () => {
  strokes = []; redrawCanvas();
  document.querySelectorAll('.ws-sticky-note').forEach(n => n.remove());
  document.querySelectorAll('.ws-highlight').forEach(h => h.replaceWith(...h.childNodes));
  actionHistory = [];
  redoHistory = [];
  modalOverlay.classList.remove('ws-show');
});


// --- 4. DRAG AND DROP LOGIC ---
let isMenuDragging = false;
let mStartX, mStartY, mInitialLeft, mInitialTop, mHasMovedMenu;

toggleBtn.addEventListener('mousedown', (e) => {
  isMenuDragging = true; mHasMovedMenu = false;
  mStartX = e.clientX; mStartY = e.clientY;
  const rect = wrapper.getBoundingClientRect();
  mInitialLeft = rect.left; mInitialTop = rect.top;
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (!isMenuDragging) return;
  const dx = e.clientX - mStartX; const dy = e.clientY - mStartY;
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) mHasMovedMenu = true;
  wrapper.style.left = `${mInitialLeft + dx}px`; wrapper.style.top = `${mInitialTop + dy}px`; wrapper.style.right = 'auto';
});

document.addEventListener('mouseup', () => {
  if (isMenuDragging && !mHasMovedMenu) {
    isMenuOpen = !isMenuOpen;
    menu.classList.toggle('ws-menu-hidden', !isMenuOpen);
  }
  isMenuDragging = false;
});

// --- 5. TOOLS GENERATOR ---
const SHAPE_TOOLS = ['shape-rect', 'shape-circle', 'shape-arrow'];

const updateActiveButton = () => {
  document.querySelectorAll('.ws-btn-tool').forEach(btn => {
    btn.classList.toggle('ws-active', btn.dataset.tool === currentTool);
  });
  // Manually highlight main toggles if one of their sub-tools is active
  const shapeMain = document.querySelector('[data-tool="shape-toggle"]');
  if (shapeMain) {
    shapeMain.classList.toggle('ws-active', SHAPE_TOOLS.includes(currentTool));
  }
  const eraserMain = document.querySelector('[data-tool="eraser-toggle"]');
  if (eraserMain) {
    eraserMain.classList.toggle('ws-active', ['eraser-normal', 'eraser-stroke'].includes(currentTool));
  }
  const laserMain = document.querySelector('[data-tool="laser-toggle"]');
  if (laserMain) {
    laserMain.classList.toggle('ws-active', ['laser-dot', 'laser-trail'].includes(currentTool));
  }
};

const createToolButton = (id, label, isTool = true) => {
  const btn = document.createElement('button');
  btn.className = `ws-btn ${isTool ? 'ws-btn-tool' : ''}`;
  btn.dataset.tool = id;
  btn.innerHTML = label;
  if (isTool) {
    btn.addEventListener('click', () => {
      currentTool = id;
      updateActiveButton();
      updateCanvasInteractivity();
    });
  }
  return btn;
};

menu.appendChild(createToolButton('cursor', '🖱️ Cursor'));
menu.appendChild(createToolButton('highlighter', '🖍️ Highlight'));
menu.appendChild(createToolButton('pen', '🖋️ Pen'));

// --- LASER POINTER SUB-MENU ---
let isLaserOpen = false;
const laserMainBtn = createToolButton('laser-toggle', '🔴 Laser', false);
const laserContainer = document.createElement('div');
laserContainer.className = 'ws-laser-container';

const laserDot = createToolButton('laser-dot', '• Dot Mode');
const laserTrail = createToolButton('laser-trail', '• Trail Mode');
laserContainer.appendChild(laserDot);
laserContainer.appendChild(laserTrail);

laserMainBtn.addEventListener('click', () => {
  isLaserOpen = !isLaserOpen;
  laserContainer.classList.toggle('ws-show', isLaserOpen);
  // Default to the last chosen/active mode
  currentTool = activeLaserMode;
  updateActiveButton();
  updateCanvasInteractivity();
});

laserDot.addEventListener('click', () => {
  activeLaserMode = 'laser-dot';
});
laserTrail.addEventListener('click', () => {
  activeLaserMode = 'laser-trail';
});

menu.appendChild(laserMainBtn);
menu.appendChild(laserContainer);
menu.appendChild(createToolButton('note', '📝 Note'));

// --- SHAPE TOOLS SUB-MENU ---
let isShapeOpen = false;
const shapeMainBtn = createToolButton('shape-toggle', '⬡ Shapes', false);
const shapeContainer = document.createElement('div');
shapeContainer.className = 'ws-shape-container';

const shapeRect = createToolButton('shape-rect', '▭ Rectangle');
const shapeCircle = createToolButton('shape-circle', '○ Circle');
const shapeArrow = createToolButton('shape-arrow', '↗ Arrow');
shapeContainer.appendChild(shapeRect);
shapeContainer.appendChild(shapeCircle);
shapeContainer.appendChild(shapeArrow);

shapeMainBtn.addEventListener('click', () => {
  isShapeOpen = !isShapeOpen;
  shapeContainer.classList.toggle('ws-show', isShapeOpen);
});

menu.appendChild(shapeMainBtn);
menu.appendChild(shapeContainer);

// --- ERASER TOOLS SUB-MENU ---
const eraserMainBtn = createToolButton('eraser-toggle', '🧼 Eraser', false);
const eraserContainer = document.createElement('div');
eraserContainer.className = 'ws-eraser-container';

const eraserNormal = createToolButton('eraser-normal', '• Normal');
const eraserStroke = createToolButton('eraser-stroke', '• Stroke');
eraserContainer.appendChild(eraserNormal);
eraserContainer.appendChild(eraserStroke);

eraserMainBtn.addEventListener('click', () => {
  isEraserOpen = !isEraserOpen;
  eraserContainer.classList.toggle('ws-show', isEraserOpen);
});

menu.appendChild(eraserMainBtn);
menu.appendChild(eraserContainer);
menu.appendChild(document.createElement('div')).className = 'ws-divider';

// --- ACTIONS & HOTKEYS ---
const undoBtn = createToolButton('undo', '↩️ Undo (Ctrl+Z)', false);
undoBtn.addEventListener('click', () => {
  if (actionHistory.length === 0) return;
  const lastAction = actionHistory.pop();

  redoHistory.push(lastAction); // Save to Redo stack

  if (lastAction.type === 'canvas') {
    strokes = JSON.parse(JSON.stringify(lastAction.previousStrokes));
    redrawCanvas();
  } else if (lastAction.type === 'note') {
    if (document.body.contains(lastAction.element)) lastAction.element.remove();
  } else if (lastAction.type === 'highlight') {
    lastAction.element.style.backgroundColor = 'transparent';
    lastAction.element.classList.remove('ws-highlight');
  }
});

const redoBtn = createToolButton('redo', '🔁 Redo (Ctrl+Y)', false);
redoBtn.addEventListener('click', () => {
  if (redoHistory.length === 0) return;
  const actionToRestore = redoHistory.pop();

  actionHistory.push(actionToRestore); // Push back to Undo stack

  if (actionToRestore.type === 'canvas') {
    strokes = JSON.parse(JSON.stringify(actionToRestore.currentStrokes));
    redrawCanvas();
  } else if (actionToRestore.type === 'note') {
    document.body.appendChild(actionToRestore.element);
  } else if (actionToRestore.type === 'highlight') {
    actionToRestore.element.style.backgroundColor = actionToRestore.element.dataset.bgColor;
    actionToRestore.element.classList.add('ws-highlight');
  }
});

const clearBtn = createToolButton('clear-all', '🗑️ Clear all', false);
clearBtn.addEventListener('click', () => {
  modalOverlay.classList.add('ws-show');
});

menu.appendChild(undoBtn);
menu.appendChild(redoBtn);
menu.appendChild(clearBtn);
menu.appendChild(document.createElement('div')).className = 'ws-divider';

// Global Hotkeys
document.addEventListener('keydown', (e) => {
  const activeNode = document.activeElement.nodeName;
  if (activeNode === 'TEXTAREA' || activeNode === 'INPUT') return;

  // Ctrl+Z or Cmd+Z
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    if (e.shiftKey) { redoBtn.click(); }
    else { undoBtn.click(); }
  }

  // Ctrl+Y or Cmd+Y
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
    e.preventDefault();
    redoBtn.click();
  }
});

// --- 6. ADVANCED COLOR PICKER ---
const colorSection = document.createElement('div');
colorSection.className = 'ws-color-section';

const customRow = document.createElement('div');
customRow.className = 'ws-custom-row';
customRow.innerText = '🎨 Colour:';

const customColorInput = document.createElement('input');
customColorInput.type = 'color';
customColorInput.value = currentColor;
customColorInput.className = 'ws-color-picker';
customColorInput.addEventListener('input', (e) => {
  currentColor = e.target.value;
  document.querySelectorAll('.ws-color-swatch').forEach(s => s.classList.remove('ws-active-color'));
});
customRow.appendChild(customColorInput);
colorSection.appendChild(customRow);

const colorRow = document.createElement('div');
colorRow.className = 'ws-color-row';

const basics = [{ hex: '#ff6b00' }, { hex: '#ef4444' }, { hex: '#22c55e' }, { hex: '#3b82f6' }, { hex: '#000000' }];

const updateActiveColor = () => {
  document.querySelectorAll('.ws-color-swatch').forEach(swatch => {
    swatch.classList.toggle('ws-active-color', swatch.dataset.hex === currentColor);
  });
};

basics.forEach(b => {
  const swatch = document.createElement('div');
  swatch.className = 'ws-color-swatch';
  swatch.style.backgroundColor = b.hex;
  swatch.dataset.hex = b.hex;
  swatch.addEventListener('click', () => {
    currentColor = b.hex;
    customColorInput.value = b.hex;
    updateActiveColor();
  });
  colorRow.appendChild(swatch);
});

colorSection.appendChild(colorRow);
menu.appendChild(colorSection);

updateActiveButton();
document.body.appendChild(wrapper);


// ==========================================
// --- 7. THE UNIFIED VECTOR CANVAS ENGINE ---
// ==========================================

const canvas = document.createElement('canvas');
canvas.id = 'ws-canvas';
canvas.style.cssText = `position: absolute; top: 0; left: 0; z-index: 999998; pointer-events: none;`;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

let strokes = [];
const ERASER_RADIUS = 6;
let currentStroke = null;
let snapshotBeforeDraw = [];

// --- SHAPE PREVIEW STATE ---
let isDrawingShape = false;
let shapeStart = null; // {x, y} in page coords

// --- LASER POINTER STATE ---
let laserStrokes = []; // [{points, born, opacity}]
let laserAnimRunning = false;
let laserDotPos = null; // {x, y} coordinates of active dot mode cursor
let activeLaserMode = 'laser-trail'; // Default active laser mode ('laser-dot' or 'laser-trail')

// ---- DRAW HELPERS ----

const drawArrowhead = (x1, y1, x2, y2, color, alpha) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 14;
  ctx.save();
  ctx.globalAlpha = alpha !== undefined ? alpha : 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - size * Math.cos(angle - Math.PI / 6), y2 - size * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - size * Math.cos(angle + Math.PI / 6), y2 - size * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

const drawShape = (stroke, alpha) => {
  if (!stroke.start || !stroke.end) return;
  const { x: x1, y: y1 } = stroke.start;
  const { x: x2, y: y2 } = stroke.end;
  ctx.save();
  ctx.globalAlpha = alpha !== undefined ? alpha : 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  if (stroke.tool === 'shape-rect') {
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  } else if (stroke.tool === 'shape-circle') {
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const rx = Math.abs(x2 - x1) / 2;
    const ry = Math.abs(y2 - y1) / 2;
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (stroke.tool === 'shape-arrow') {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    drawArrowhead(x1, y1, x2, y2, stroke.color, alpha);
  }
  if (stroke.tool !== 'shape-circle' && stroke.tool !== 'shape-arrow') ctx.stroke();
  ctx.restore();
};

// --- LASER PREMIUM RENDERING HELPERS ---
const getLaserColors = (hex) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  if (!result) return { glow: '#FF073A', core: '#FFFFFF' }; // Neon Red default

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  // If color is black or extremely dark
  if (r < 50 && g < 50 && b < 50) {
    return { glow: '#555555', core: '#000000' };
  }

  let glowColor = '#FF073A';
  if (r > g && r > b) {
    if (g > 80) glowColor = '#FF5F00'; // Neon Orange
    else glowColor = '#FF073A'; // Neon Red
  } else if (g > r && g > b) {
    glowColor = '#00FF66'; // Neon Green
  } else if (b > r && b > g) {
    glowColor = '#00F0FF'; // Neon Blue
  } else {
    glowColor = '#FF073A'; // Default to Neon Red
  }
  return { glow: glowColor, core: '#FFFFFF' };
};

const drawLaserStroke = (stroke, alpha) => {
  if (stroke.points.length < 1) return;
  const { glow: glowColor, core: coreColor } = getLaserColors(stroke.color);
  const strokeAlpha = alpha !== undefined ? alpha : 1;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalCompositeOperation = 'source-over';

  // --- LAYER 2 & 3: Neon Glow + Soft Drop-Off Blur ---
  ctx.beginPath();
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 10;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 12;
  ctx.globalAlpha = strokeAlpha;

  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let i = 1; i < stroke.points.length; i++) {
    ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
  }
  ctx.stroke();
  ctx.restore();

  // --- LAYER 1: The Inner Core (Bright White or Black) ---
  ctx.save();
  ctx.beginPath();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = coreColor;
  ctx.lineWidth = 3.5;
  ctx.globalAlpha = strokeAlpha;

  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let i = 1; i < stroke.points.length; i++) {
    ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
  }
  ctx.stroke();
  ctx.restore();
};

const drawLaserDot = (x, y) => {
  const { glow: glowColor, core: coreColor } = getLaserColors(currentColor);

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';

  // Layer 3 (Soft Drop-Off) & Layer 2 (Neon Glow)
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 12;
  ctx.fillStyle = glowColor;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fill();

  // Layer 1: Inner Core (Bright White or Black)
  ctx.shadowBlur = 0;
  ctx.fillStyle = coreColor;
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

const drawSingleStroke = (stroke, alpha) => {
  if (stroke.tool === 'shape-rect' || stroke.tool === 'shape-circle' || stroke.tool === 'shape-arrow') {
    drawShape(stroke, alpha);
    return;
  }
  if (stroke.tool === 'laser' || stroke.tool === 'laser-trail') {
    drawLaserStroke(stroke, alpha);
    return;
  }
  if (stroke.points.length < 1) return;
  ctx.save();
  ctx.beginPath();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (stroke.tool === 'pen') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = 4;
    if (alpha !== undefined) ctx.globalAlpha = alpha;
  } else if (stroke.tool === 'eraser-normal') {
    ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = ERASER_RADIUS * 2;
  }
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let i = 1; i < stroke.points.length; i++) { ctx.lineTo(stroke.points[i].x, stroke.points[i].y); }
  ctx.stroke();
  ctx.restore();
};

const redrawCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  strokes.forEach(stroke => drawSingleStroke(stroke));
  if (currentStroke) drawSingleStroke(currentStroke);
  // Draw live laser strokes (fade handled by laserLoop)
  laserStrokes.forEach(ls => drawSingleStroke(ls, ls.opacity));

  // Draw active laser dot in Dot Mode
  if (currentTool === 'laser-dot' && laserDotPos) {
    drawLaserDot(laserDotPos.x, laserDotPos.y);
  }
};

const resizeCanvas = () => {
  canvas.width = document.documentElement.scrollWidth; canvas.height = document.documentElement.scrollHeight; redrawCanvas();
};
resizeCanvas(); window.addEventListener('resize', resizeCanvas);

const updateCanvasInteractivity = () => {
  const isDrawTool = ['pen', 'laser', 'laser-dot', 'laser-trail', 'eraser-normal', 'eraser-stroke', ...SHAPE_TOOLS].includes(currentTool);
  if (isDrawTool) {
    canvas.style.pointerEvents = 'auto';
    if (currentTool === 'laser-dot') {
      canvas.style.cursor = 'none'; // Always hide browser cursor in Dot Mode
    } else {
      canvas.style.cursor = ['laser', 'laser-trail'].includes(currentTool) ? 'crosshair' : 'default';
    }
  } else {
    canvas.style.pointerEvents = 'none';
    canvas.style.cursor = 'default';
  }
};

const pointToSegmentDistance = (px, py, x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
};

const segmentsIntersect = (A, B, C, D) => {
  const ccw = (p1, p2, p3) => (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
  return ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D);
};

const segmentToSegmentDistance = (A, B, C, D) => {
  if (segmentsIntersect(A, B, C, D)) {
    return 0;
  }
  return Math.min(
    pointToSegmentDistance(A.x, A.y, C.x, C.y, D.x, D.y),
    pointToSegmentDistance(B.x, B.y, C.x, C.y, D.x, D.y),
    pointToSegmentDistance(C.x, C.y, A.x, A.y, B.x, B.y),
    pointToSegmentDistance(D.x, D.y, A.x, A.y, B.x, B.y)
  );
};

const checkStrokeIntersection = (x, y) => {
  let wasStrokeRemoved = false;
  const detectionRadius = 16;
  for (let i = strokes.length - 1; i >= 0; i--) {
    const stroke = strokes[i];
    if (stroke.tool !== 'pen') continue;
    for (let pt of stroke.points) {
      if (Math.hypot(pt.x - x, pt.y - y) < detectionRadius) { strokes.splice(i, 1); wasStrokeRemoved = true; break; }
    }
  }
  if (wasStrokeRemoved) redrawCanvas();
};

// ==========================================
// --- LASER POINTER FADE LOOP ---
// ==========================================
const LASER_DURATION = 1500; // ms until fully faded (1.5 seconds)

const laserLoop = () => {
  const now = Date.now();
  let anyAlive = false;

  // If user is actively holding down mouse/stylus to draw a trail, prevent fading of existing lines
  const isCurrentlyDrawingLaser = isDrawingCanvas && (currentTool === 'laser-trail' || currentTool === 'laser');
  if (isCurrentlyDrawingLaser) {
    laserStrokes.forEach(ls => {
      ls.born = now;
      ls.opacity = 1;
    });
  }

  laserStrokes = laserStrokes.filter(ls => {
    const age = now - ls.born;
    ls.opacity = Math.max(0, 1 - age / LASER_DURATION);
    return ls.opacity > 0;
  });
  if (laserStrokes.length > 0) anyAlive = true;
  // Also show the in-progress laser stroke
  if (currentStroke && (currentStroke.tool === 'laser' || currentStroke.tool === 'laser-trail')) anyAlive = true;
  redrawCanvas();
  if (anyAlive) {
    requestAnimationFrame(laserLoop);
  } else {
    laserAnimRunning = false;
  }
};

// ==========================================
// --- DRAWING MOUSE EVENTS ---
// ==========================================
let isDrawingCanvas = false;

canvas.addEventListener('mousedown', (e) => {
  const allDrawTools = ['pen', 'laser', 'laser-dot', 'laser-trail', 'eraser-normal', 'eraser-stroke', ...SHAPE_TOOLS];
  if (!allDrawTools.includes(currentTool)) return;

  snapshotBeforeDraw = JSON.parse(JSON.stringify(strokes));

  if (currentTool === 'pen' || currentTool === 'eraser-normal') {
    isDrawingCanvas = true;
    currentStroke = { id: 's_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9), tool: currentTool, color: currentColor, points: [{ x: e.pageX, y: e.pageY }] };
    redrawCanvas();
  } else if (currentTool === 'laser-dot') {
    isDrawingCanvas = true;
    laserDotPos = { x: e.pageX, y: e.pageY };
    redrawCanvas();
  } else if (currentTool === 'laser-trail' || currentTool === 'laser') {
    isDrawingCanvas = true;
    currentStroke = { tool: currentTool === 'laser' ? 'laser-trail' : currentTool, color: currentColor, points: [{ x: e.pageX, y: e.pageY }] };
    // Fade reset: instantly make all existing laser strokes bright again
    laserStrokes.forEach(ls => {
      ls.born = Date.now();
    });
    redrawCanvas();
  } else if (SHAPE_TOOLS.includes(currentTool)) {
    isDrawingShape = true;
    shapeStart = { x: e.pageX, y: e.pageY };
    currentStroke = { id: 's_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9), tool: currentTool, color: currentColor, start: shapeStart, end: { ...shapeStart } };
  } else if (currentTool === 'eraser-stroke') {
    checkStrokeIntersection(e.pageX, e.pageY);
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (currentTool === 'eraser-stroke') {
    if (e.buttons !== 1) return;
    checkStrokeIntersection(e.pageX, e.pageY);
  }

  // Handle dot pointer tracking (dot acts as the cursor)
  if (currentTool === 'laser-dot') {
    laserDotPos = { x: e.pageX, y: e.pageY };
    redrawCanvas();
    return;
  }

  if (!isDrawingCanvas && !isDrawingShape) return;

  if (currentTool === 'pen' || currentTool === 'eraser-normal') {
    currentStroke.points.push({ x: e.pageX, y: e.pageY });

    if (currentTool === 'eraser-normal') {
      const pointsCount = currentStroke.points.length;
      const eraserA = pointsCount > 1 ? currentStroke.points[pointsCount - 2] : currentStroke.points[0];
      const eraserB = currentStroke.points[pointsCount - 1];

      for (let i = strokes.length - 1; i >= 0; i--) {
        const stroke = strokes[i];
        if (stroke.tool !== 'pen') continue;

        let newStrokes = [];
        let currentSegment = [];

        if (stroke.points.length === 1) {
          const pt = stroke.points[0];
          const dist = pointToSegmentDistance(pt.x, pt.y, eraserA.x, eraserA.y, eraserB.x, eraserB.y);
          if (dist > ERASER_RADIUS) {
            newStrokes.push(stroke);
          }
        } else {
          for (let j = 0; j < stroke.points.length; j++) {
            const pt = stroke.points[j];
            const isPtInside = pointToSegmentDistance(pt.x, pt.y, eraserA.x, eraserA.y, eraserB.x, eraserB.y) <= ERASER_RADIUS;

            if (isPtInside) {
              if (currentSegment.length > 0) {
                newStrokes.push({
                  id: stroke.id || ('s_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)),
                  tool: 'pen',
                  color: stroke.color,
                  points: currentSegment
                });
                currentSegment = [];
              }
            } else {
              if (currentSegment.length > 0) {
                const prevPt = currentSegment[currentSegment.length - 1];
                const segmentCut = segmentToSegmentDistance(prevPt, pt, eraserA, eraserB) <= ERASER_RADIUS;
                if (segmentCut) {
                  newStrokes.push({
                    id: stroke.id || ('s_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)),
                    tool: 'pen',
                    color: stroke.color,
                    points: currentSegment
                  });
                  currentSegment = [pt];
                } else {
                  currentSegment.push(pt);
                }
              } else {
                currentSegment.push(pt);
              }
            }
          }
          if (currentSegment.length > 0) {
            newStrokes.push({
              id: stroke.id || ('s_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)),
              tool: 'pen',
              color: stroke.color,
              points: currentSegment
            });
          }
        }

        let hasChanged = false;
        if (newStrokes.length !== 1) {
          hasChanged = true;
        } else if (newStrokes[0].points.length !== stroke.points.length) {
          hasChanged = true;
        } else {
          for (let k = 0; k < stroke.points.length; k++) {
            if (newStrokes[0].points[k].x !== stroke.points[k].x || newStrokes[0].points[k].y !== stroke.points[k].y) {
              hasChanged = true;
              break;
            }
          }
        }

        if (hasChanged) {
          strokes.splice(i, 1, ...newStrokes);
        }
      }
    }
    redrawCanvas();
  } else if ((currentTool === 'laser-trail' || currentTool === 'laser') && isDrawingCanvas) {
    currentStroke.points.push({ x: e.pageX, y: e.pageY });
    // Fade reset: keep all other laser strokes fully bright while drawing
    laserStrokes.forEach(ls => {
      ls.born = Date.now();
    });
    redrawCanvas();
  } else if (isDrawingShape && currentStroke) {
    // Live shape preview: update end point and redraw
    currentStroke.end = { x: e.pageX, y: e.pageY };
    redrawCanvas();
  }
});

canvas.addEventListener('mouseup', () => {
  // Commit laser stroke to fade queue
  if ((currentTool === 'laser-trail' || currentTool === 'laser') && isDrawingCanvas && currentStroke) {
    const finishedLaser = { ...currentStroke, born: Date.now(), opacity: 1 };
    laserStrokes.push(finishedLaser);
    currentStroke = null;
    isDrawingCanvas = false;
    if (!laserAnimRunning) { laserAnimRunning = true; requestAnimationFrame(laserLoop); }
    return; // Laser strokes are NOT saved to history
  }

  // Handle laser-dot mouseup
  if (currentTool === 'laser-dot') {
    isDrawingCanvas = false;
    // Keep laserDotPos as active to continue tracking on hover
    redrawCanvas();
    return;
  }

  // Commit shape stroke to permanent strokes
  if (isDrawingShape && currentStroke) {
    strokes.push(currentStroke);
    currentStroke = null;
    isDrawingShape = false;
    redrawCanvas();
    actionHistory.push({ type: 'canvas', previousStrokes: snapshotBeforeDraw, currentStrokes: JSON.parse(JSON.stringify(strokes)) });
    redoHistory = [];
    return;
  }

  if (isDrawingCanvas || currentTool === 'eraser-stroke') {
    if (isDrawingCanvas && currentStroke) {
      if (currentTool !== 'eraser-normal') {
        strokes.push(currentStroke);
      }
      currentStroke = null;
    }
    isDrawingCanvas = false;
    redrawCanvas();

    // Save current strokes state alongside previous state for Redo logic
    actionHistory.push({ type: 'canvas', previousStrokes: snapshotBeforeDraw, currentStrokes: JSON.parse(JSON.stringify(strokes)) });
    redoHistory = []; // Wipe redo stack when a new action is performed
  }
});

// Ensure Dot Mode tracks immediately when cursor enters canvas
canvas.addEventListener('mouseenter', (e) => {
  if (currentTool === 'laser-dot') {
    laserDotPos = { x: e.pageX, y: e.pageY };
    redrawCanvas();
  }
});

// Prevent stuck pointer/dot modes when mouse leaves canvas
canvas.addEventListener('mouseleave', () => {
  if (currentTool === 'laser-dot') {
    laserDotPos = null;
    isDrawingCanvas = false;
    redrawCanvas();
  } else if (isDrawingCanvas && (currentTool === 'laser-trail' || currentTool === 'laser')) {
    if (currentStroke) {
      const finishedLaser = { ...currentStroke, born: Date.now(), opacity: 1 };
      laserStrokes.push(finishedLaser);
      currentStroke = null;
    }
    isDrawingCanvas = false;
    if (!laserAnimRunning) { laserAnimRunning = true; requestAnimationFrame(laserLoop); }
  } else if (isDrawingCanvas) {
    if (currentStroke) {
      strokes.push(currentStroke);
      currentStroke = null;
    }
    isDrawingCanvas = false;
    redrawCanvas();
  }
});


// ==========================================
// --- 8. THE DOM ENGINE ---
// ==========================================

// --- HIGHLIGHT SERIALIZATION & RESTORATION UTILITIES ---
const getTextOffset = (ancestor, node, offset) => {
  let charCount = 0;
  let found = false;

  const traverse = (current) => {
    if (found) return;
    if (current === node) {
      charCount += offset;
      found = true;
      return;
    }
    if (current.nodeType === Node.TEXT_NODE) {
      charCount += current.textContent.length;
    } else {
      for (let child of current.childNodes) {
        traverse(child);
        if (found) return;
      }
    }
  };

  traverse(ancestor);
  return found ? charCount : -1;
};

const getNodeAndOffsetAt = (ancestor, targetOffset) => {
  let charCount = 0;
  let result = null;

  const traverse = (current) => {
    if (result) return;
    if (current.nodeType === Node.TEXT_NODE) {
      const len = current.textContent.length;
      if (charCount + len > targetOffset) {
        result = { node: current, offset: targetOffset - charCount };
        return;
      }
      charCount += len;
    } else {
      for (let child of current.childNodes) {
        traverse(child);
        if (result) return;
      }
    }
  };

  traverse(ancestor);

  if (!result && charCount === targetOffset) {
    let lastTextNode = null;
    const findLastText = (current) => {
      if (current.nodeType === Node.TEXT_NODE) {
        lastTextNode = current;
      } else {
        for (let i = current.childNodes.length - 1; i >= 0; i--) {
          findLastText(current.childNodes[i]);
          if (lastTextNode) return;
        }
      }
    };
    findLastText(ancestor);
    if (lastTextNode) {
      result = { node: lastTextNode, offset: lastTextNode.textContent.length };
    }
  }
  return result;
};

const getUniqueSelector = (el) => {
  const path = [];
  while (el && el.nodeType === Node.ELEMENT_NODE) {
    if (el.classList.contains('ws-highlight')) {
      el = el.parentNode;
      continue;
    }
    if (el.id) {
      path.unshift('#' + CSS.escape(el.id));
      break;
    }
    let tag = el.nodeName.toLowerCase();
    let sibling = el;
    let nth = 1;
    while (sibling = sibling.previousElementSibling) {
      if (sibling.classList.contains('ws-highlight')) {
        continue;
      }
      if (sibling.nodeName.toLowerCase() === tag) {
        nth++;
      }
    }
    path.unshift(`${tag}:nth-of-type(${nth})`);
    el = el.parentNode;
  }
  return path.join(' > ');
};

const deserializeRange = (serialized) => {
  const ancestor = document.querySelector(serialized.selector);
  if (!ancestor) return null;

  const startInfo = getNodeAndOffsetAt(ancestor, serialized.startOffset);
  const endInfo = getNodeAndOffsetAt(ancestor, serialized.endOffset);

  if (!startInfo || !endInfo) return null;

  const range = document.createRange();
  range.setStart(startInfo.node, startInfo.offset);
  range.setEnd(endInfo.node, endInfo.offset);
  return range;
};

// --- HIGHLIGHTER ---
document.addEventListener('mouseup', () => {
  if (currentTool === 'highlighter') {
    const selection = window.getSelection();
    if (!selection.isCollapsed && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.className = 'ws-highlight';

      const highlightColor = currentColor + '66';
      span.dataset.bgColor = highlightColor;
      span.style.backgroundColor = highlightColor;
      span.style.color = 'inherit';

      try {
        range.surroundContents(span);
        actionHistory.push({ type: 'highlight', element: span });
        redoHistory = []; // Wipe redo stack when a new action is performed
        triggerAutoSave();
      } catch (er) { console.warn("WebScribe: Text structure too complex to highlight."); }
      selection.removeAllRanges();
    }
  }
});

const checkDomHighlightEraser = (e) => {
  if (currentTool === 'eraser-stroke') {
    canvas.style.pointerEvents = 'none';
    const element = document.elementFromPoint(e.clientX, e.clientY);
    canvas.style.pointerEvents = 'auto';

    const highlight = element?.closest('.ws-highlight');
    if (highlight) {
      highlight.replaceWith(...highlight.childNodes);
      triggerAutoSave();
    }
  }
};

canvas.addEventListener('click', checkDomHighlightEraser);
canvas.addEventListener('mousemove', (e) => {
  if (e.buttons === 1) checkDomHighlightEraser(e);
});

// --- STICKY NOTES ---
document.addEventListener('click', (e) => {
  if (currentTool === 'note') {
    if (e.target.closest('#ws-wrapper') || e.target.closest('.ws-sticky-note') || e.target.closest('.ws-modal-overlay')) return;

    const note = document.createElement('div');
    note.className = 'ws-sticky-note';
    note.style.left = e.pageX + 'px';
    note.style.top = e.pageY + 'px';

    const header = document.createElement('div');
    header.className = 'ws-note-header';
    header.style.backgroundColor = currentColor;

    const closeBtn = document.createElement('div');
    closeBtn.className = 'ws-note-close';
    closeBtn.innerHTML = '✖';
    closeBtn.addEventListener('click', () => {
      note.remove();
      triggerAutoSave();
    });

    header.appendChild(closeBtn);

    const textArea = document.createElement('textarea');
    textArea.className = 'ws-note-body';
    textArea.placeholder = 'Type a note...';

    note.appendChild(header);
    note.appendChild(textArea);
    document.body.appendChild(note);

    actionHistory.push({ type: 'note', element: note });
    redoHistory = []; // Wipe redo stack when a new action is performed

    let isDraggingNote = false;
    let nStartX, nStartY, nStartLeft, nStartTop;

    header.addEventListener('mousedown', (ev) => {
      isDraggingNote = true;
      nStartX = ev.clientX; nStartY = ev.clientY;
      nStartLeft = parseInt(note.style.left || 0, 10); nStartTop = parseInt(note.style.top || 0, 10);
      ev.preventDefault();
    });

    const doNoteDrag = (ev) => {
      if (!isDraggingNote) return;
      note.style.left = nStartLeft + (ev.clientX - nStartX) + 'px';
      note.style.top = nStartTop + (ev.clientY - nStartY) + 'px';
    };
    const stopNoteDrag = () => { isDraggingNote = false; };
    document.addEventListener('mousemove', doNoteDrag);
    document.addEventListener('mouseup', stopNoteDrag);

    currentTool = 'cursor'; updateActiveButton(); updateCanvasInteractivity();
  }
});

// ==========================================
// --- 9. MASTER KILL SWITCH (POPUP LISTENER) ---
// ==========================================
const applyMasterState = (isActive) => {
  const wrapper = document.getElementById('ws-wrapper');
  const canvas = document.getElementById('ws-canvas');

  if (isActive) {
    if (wrapper) wrapper.style.display = 'block';
    if (canvas) canvas.style.display = 'block';
    document.querySelectorAll('.ws-sticky-note').forEach(n => n.style.display = 'flex');
    document.querySelectorAll('.ws-highlight').forEach(h => {
      h.style.backgroundColor = h.dataset.bgColor || '#ff6b0066';
    });
  } else {
    if (wrapper) wrapper.style.display = 'none';
    if (canvas) canvas.style.display = 'none';
    document.querySelectorAll('.ws-sticky-note').forEach(n => n.style.display = 'none');
    document.querySelectorAll('.ws-highlight').forEach(h => h.style.backgroundColor = 'transparent');
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle_extension') {
    applyMasterState(request.isActive);
  }
});

chrome.storage.local.get(['webScribeActive'], (result) => {
  if (result.webScribeActive === false) {
    applyMasterState(false);
  }
});

// ==========================================
// --- 10. FIREBASE AUTO-SAVE ENGINE ---
// ==========================================

const triggerAutoSave = () => {
  // 1. Grab all strokes (already cleanly formatted in arrays)
  const dataStrokes = strokes;

  // 2. Extract DOM Notes into pure data
  const dataNotes = [];
  document.querySelectorAll('.ws-sticky-note').forEach(note => {
    dataNotes.push({
      left: note.style.left,
      top: note.style.top,
      color: note.querySelector('.ws-note-header').style.backgroundColor,
      text: note.querySelector('.ws-note-body').value
    });
  });

  // 3. Extract DOM Highlights into pure data
  const dataHighlights = [];
  document.querySelectorAll('.ws-highlight').forEach(span => {
    const textNodes = [];
    const findTextNodes = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node);
      } else {
        node.childNodes.forEach(findTextNodes);
      }
    };
    findTextNodes(span);

    if (textNodes.length > 0) {
      let ancestor = span.parentNode;
      while (ancestor && ancestor.classList && ancestor.classList.contains('ws-highlight')) {
        ancestor = ancestor.parentNode;
      }
      if (!ancestor) return;

      const firstText = textNodes[0];
      const lastText = textNodes[textNodes.length - 1];
      const startOffset = getTextOffset(ancestor, firstText, 0);
      const endOffset = getTextOffset(ancestor, lastText, lastText.textContent.length);
      const selector = getUniqueSelector(ancestor);

      dataHighlights.push({
        selector: selector,
        startOffset: startOffset,
        endOffset: endOffset,
        color: span.dataset.bgColor || span.style.backgroundColor || currentColor + '66',
        text: span.textContent
      });
    }
  });

  // 4. Send payload to background.js
  chrome.runtime.sendMessage({
    action: 'auto_save',
    data: {
      strokes: dataStrokes,
      notes: dataNotes,
      highlights: dataHighlights,
      title: document.title || window.location.hostname,
      updatedAt: Date.now()
    }
  });
};

// --- BIND TRIGGERS ---
// Listen for canvas drawing completion
canvas.addEventListener('mouseup', () => {
  // Shapes and regular pen/eraser strokes get saved; laser is ephemeral and intentionally skipped
  if (['pen', 'eraser-normal', 'eraser-stroke', ...SHAPE_TOOLS].includes(currentTool)) {
    triggerAutoSave();
  }
});

// Listen for note typing completion (triggers when you click outside the textarea)
document.addEventListener('focusout', (e) => {
  if (e.target.classList.contains('ws-note-body')) {
    triggerAutoSave();
  }
});

// Bind to Undo/Redo/Clear Actions
undoBtn.addEventListener('click', triggerAutoSave);
redoBtn.addEventListener('click', triggerAutoSave);
document.getElementById('ws-confirm-clear').addEventListener('click', triggerAutoSave);

// ==========================================
// --- 11. FIREBASE AUTO-LOAD ENGINE ---
// ==========================================

const loadSavedData = () => {
  chrome.runtime.sendMessage({ action: 'auto_load' }, (response) => {
    if (response && response.status === 'success') {
      const savedData = response.data;

      // 1. Restore Canvas Strokes
      if (savedData.strokes && savedData.strokes.length > 0) {
        // Overwrite the local strokes array with the saved ones
        strokes = savedData.strokes;

        // Call your existing function that redraws the canvas
        // (Assuming your redraw function is called redrawCanvas. Change this if yours is named differently!)
        redrawCanvas();
      }

      // 2. Restore Sticky Notes
      if (savedData.notes && savedData.notes.length > 0) {
        savedData.notes.forEach(noteData => {
          // Recreate the exact HTML structure of your notes
          const noteEl = document.createElement('div');
          noteEl.className = 'ws-sticky-note';
          noteEl.style.position = 'absolute';
          noteEl.style.left = noteData.left;
          noteEl.style.top = noteData.top;

          noteEl.innerHTML = `
            <div class="ws-note-header" style="background-color: ${noteData.color};">
              <span class="ws-close-btn">&times;</span>
            </div>
            <textarea class="ws-note-body">${noteData.text}</textarea>
          `;

          // Re-attach the delete button logic for these loaded notes
          noteEl.querySelector('.ws-close-btn').addEventListener('click', () => {
            noteEl.remove();
            triggerAutoSave(); // Save the deletion to the cloud!
          });

          // Re-attach the auto-save trigger for when you edit a loaded note
          noteEl.querySelector('.ws-note-body').addEventListener('focusout', triggerAutoSave);

          document.body.appendChild(noteEl);
        });
      }

      // 3. Restore Highlights
      if (savedData.highlights && savedData.highlights.length > 0) {
        savedData.highlights.forEach(highlightData => {
          try {
            const range = deserializeRange(highlightData);
            if (range) {
              if (range.toString().trim() === highlightData.text.trim()) {
                const span = document.createElement('span');
                span.className = 'ws-highlight';
                span.dataset.bgColor = highlightData.color;
                span.style.backgroundColor = highlightData.color;
                span.style.color = 'inherit';
                range.surroundContents(span);
              } else {
                console.warn("WebScribe: Highlight text mismatch. Expected:", highlightData.text, "Got:", range.toString());
              }
            }
          } catch (err) {
            console.error("WebScribe: Error restoring highlight:", err);
          }
        });
      }
    }
  });
};

// Trigger the load when the extension initializes!
// Wait a tiny bit to ensure the canvas is fully injected into the page first.
setTimeout(loadSavedData, 500);