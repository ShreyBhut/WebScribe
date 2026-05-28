// --- 1. STATE MANAGEMENT ---
let currentTool = 'cursor';
let currentColor = '#ffeb3b';
let isMenuOpen = true;
let isEraserOpen = false;

// --- 2. INJECT ULTRA-MODERN BOLD CSS ---
const style = document.createElement('style');
style.textContent = `
  #ws-wrapper { position: fixed; top: 15px; right: 15px; z-index: 999999; font-family: 'Segoe UI', system-ui, sans-serif; user-select: none; }
  .ws-main-toggle { background: #000000; border: 3px solid #000000; border-radius: 30px; padding: 8px 14px; cursor: move; font-weight: bold; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); color: #ffffff; display: flex; align-items: center; justify-content: center; gap: 6px; transition: transform 0.1s, background-color 0.2s; }
  .ws-main-toggle:hover { background: #222222; }
  #ws-menu { background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(10px); border: 3px solid #000000; border-radius: 14px; padding: 6px; margin-top: 8px; display: flex; flex-direction: column; gap: 4px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); width: 125px; transition: opacity 0.2s; }
  .ws-menu-hidden { display: none !important; }
  .ws-btn { background: transparent; border: none; padding: 6px 8px; text-align: left; cursor: pointer; border-radius: 6px; font-size: 12px; color: #111827; display: flex; align-items: center; gap: 6px; font-weight: bold; transition: background 0.2s; width: 100%; }
  .ws-btn:hover { background: #f3f4f6; }
  .ws-btn.ws-active { background: #000000; color: #ffffff; }
  .ws-eraser-container { display: none; flex-direction: column; gap: 2px; padding-left: 12px; border-left: 2px solid #000000; margin-left: 8px; }
  .ws-eraser-container.ws-show { display: flex; }
  .ws-divider { height: 2px; background: #000000; margin: 4px 0; }
  .ws-color-section { display: flex; flex-direction: column; gap: 6px; padding: 4px; font-size: 12px; font-weight: bold; color: #111827; }
  .ws-custom-row { display: flex; align-items: center; justify-content: space-between; }
  .ws-color-row { display: flex; gap: 6px; justify-content: space-between; margin-top: 2px; }
  .ws-color-swatch { width: 16px; height: 16px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: transform 0.1s; }
  .ws-color-swatch:hover { transform: scale(1.2); }
  .ws-color-swatch.ws-active-color { border-color: #000000; transform: scale(1.2); }
  .ws-color-picker { width: 18px; height: 18px; padding: 0; border: none; border-radius: 50%; cursor: pointer; background: transparent; }
  .ws-color-picker::-webkit-color-swatch { border-radius: 50%; border: 2px solid #000000; }
`;
document.head.appendChild(style);

// --- 3. BUILD DOM STRUCTURE ---
const wrapper = document.createElement('div');
wrapper.id = 'ws-wrapper';

const toggleBtn = document.createElement('button');
toggleBtn.className = 'ws-main-toggle';
toggleBtn.innerHTML = '✏️ WebScribe';
wrapper.appendChild(toggleBtn);

const menu = document.createElement('div');
menu.id = 'ws-menu';
wrapper.appendChild(menu);

// --- 4. DRAG AND DROP LOGIC ---
let isDragging = false;
let startX, startY, initialX, initialY;
let hasMoved = false;

toggleBtn.addEventListener('mousedown', (e) => {
  isDragging = true; hasMoved = false;
  startX = e.clientX; startY = e.clientY;
  const rect = wrapper.getBoundingClientRect();
  initialX = rect.left; initialY = rect.top;
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - startX; const dy = e.clientY - startY;
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMoved = true;
  wrapper.style.left = `${initialX + dx}px`; wrapper.style.top = `${initialY + dy}px`; wrapper.style.right = 'auto';
});

document.addEventListener('mouseup', () => {
  if (isDragging && !hasMoved) {
    isMenuOpen = !isMenuOpen;
    menu.classList.toggle('ws-menu-hidden', !isMenuOpen);
  }
  isDragging = false;
});

// --- 5. TOOLS GENERATOR ---
const updateActiveButton = () => {
  document.querySelectorAll('.ws-btn-tool').forEach(btn => {
    btn.classList.toggle('ws-active', btn.dataset.tool === currentTool);
  });
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
      console.log("Tool active:", currentTool);
    });
  }
  return btn;
};

menu.appendChild(createToolButton('cursor', '🖱️ Cursor'));
menu.appendChild(createToolButton('highlighter', '🖍️ Highlight'));
menu.appendChild(createToolButton('pen', '🖋️ Pen'));
menu.appendChild(createToolButton('note', '📝 Note'));

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

const undoBtn = createToolButton('undo', '↩️ Undo', false);
const clearBtn = createToolButton('clear-all', '🗑️ Clear all', false);
menu.appendChild(undoBtn);
menu.appendChild(clearBtn);
menu.appendChild(document.createElement('div')).className = 'ws-divider';

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

const basics = [ { hex: '#ef4444' }, { hex: '#22c55e' }, { hex: '#eab308' }, { hex: '#3b82f6' } ];

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
// --- 7. THE UPGRADED CANVAS ENGINE ---
// ==========================================

const canvas = document.createElement('canvas');
canvas.id = 'ws-canvas';
canvas.style.cssText = `
  position: absolute; top: 0; left: 0; z-index: 999998; pointer-events: none;
`;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

let strokes = [];       
let currentStroke = null; 

const redrawCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  strokes.forEach(stroke => {
    if (stroke.points.length < 1) return;
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (stroke.tool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 4;
    } else if (stroke.tool === 'eraser-normal') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 25;
    }
    
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  });
};

const resizeCanvas = () => {
  canvas.width = document.documentElement.scrollWidth;
  canvas.height = document.documentElement.scrollHeight;
  redrawCanvas(); 
};
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const updateCanvasInteractivity = () => {
  if (['pen', 'eraser-normal', 'eraser-stroke'].includes(currentTool)) {
    canvas.style.pointerEvents = 'auto';
  } else {
    canvas.style.pointerEvents = 'none';
  }
};

const checkStrokeIntersection = (x, y) => {
  let wasStrokeRemoved = false;
  const detectionRadius = 16; 

  for (let i = strokes.length - 1; i >= 0; i--) {
    const stroke = strokes[i];
    if (stroke.tool !== 'pen') continue; 
    
    for (let pt of stroke.points) {
      if (Math.hypot(pt.x - x, pt.y - y) < detectionRadius) {
        strokes.splice(i, 1); 
        wasStrokeRemoved = true;
        break; 
      }
    }
  }
  if (wasStrokeRemoved) redrawCanvas(); 
};

// --- DRAWING MOUSE EVENTS ---
let isDrawing = false;

canvas.addEventListener('mousedown', (e) => {
  if (!['pen', 'eraser-normal', 'eraser-stroke'].includes(currentTool)) return;
  isDrawing = true;
  
  if (currentTool === 'pen' || currentTool === 'eraser-normal') {
    currentStroke = {
      tool: currentTool,
      color: currentColor,
      points: [{ x: e.pageX, y: e.pageY }]
    };
    
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (currentTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 4;
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 25;
    }
    ctx.moveTo(e.pageX, e.pageY);
  } else if (currentTool === 'eraser-stroke') {
    checkStrokeIntersection(e.pageX, e.pageY);
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  
  if (currentTool === 'pen' || currentTool === 'eraser-normal') {
    ctx.lineTo(e.pageX, e.pageY);
    ctx.stroke();
    currentStroke.points.push({ x: e.pageX, y: e.pageY });

    // --- VECTOR SEVERING LOGIC FOR NORMAL ERASER ---
    if (currentTool === 'eraser-normal') {
      const eraserRadius = 15; // Hitbox radius of the normal eraser
      
      for (let i = strokes.length - 1; i >= 0; i--) {
        const stroke = strokes[i];
        if (stroke.tool !== 'pen') continue;

        let newStrokes = [];
        let currentSegment = [];

        for (let j = 0; j < stroke.points.length; j++) {
          const pt = stroke.points[j];
          const distance = Math.hypot(pt.x - e.pageX, pt.y - e.pageY);

          if (distance > eraserRadius) {
            currentSegment.push(pt);
          } else {
            // Point erased. Cap off the current segment if it has data.
            if (currentSegment.length > 0) {
              newStrokes.push({ tool: 'pen', color: stroke.color, points: currentSegment });
              currentSegment = [];
            }
          }
        }
        
        // Push the final segment if it has leftover data
        if (currentSegment.length > 0) {
          newStrokes.push({ tool: 'pen', color: stroke.color, points: currentSegment });
        }

        // If the stroke was split into multiple segments (or completely erased), update the array
        if (newStrokes.length !== 1 || newStrokes[0].points.length !== stroke.points.length) {
          strokes.splice(i, 1, ...newStrokes);
        }
      }
    }
  } else if (currentTool === 'eraser-stroke') {
    checkStrokeIntersection(e.pageX, e.pageY);
  }
});

canvas.addEventListener('mouseup', () => {
  if (isDrawing) {
    isDrawing = false;
    if (currentStroke) {
      strokes.push(currentStroke);
      currentStroke = null;
    }
    ctx.closePath();
  }
});