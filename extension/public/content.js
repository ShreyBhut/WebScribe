// --- 1. STATE MANAGEMENT ---
let currentTool = 'cursor';
let currentColor = '#ffeb3b'; // Default yellow
let isMenuOpen = true;
let isEraserOpen = false;

// --- 2. INJECT ULTRA-MODERN BOLD CSS ---
const style = document.createElement('style');
style.textContent = `
  #ws-wrapper {
    position: fixed; top: 15px; right: 15px; z-index: 999999;
    font-family: 'Segoe UI', system-ui, sans-serif;
    user-select: none;
  }
  .ws-main-toggle {
    background: #000000; border: 3px solid #000000; border-radius: 30px;
    padding: 8px 14px; cursor: move; font-weight: bold; font-size: 13px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); color: #ffffff;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: transform 0.1s, background-color 0.2s;
  }
  .ws-main-toggle:hover { background: #222222; }
  
  #ws-menu {
    background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(10px);
    border: 3px solid #000000; border-radius: 14px; padding: 6px;
    margin-top: 8px; display: flex; flex-direction: column; gap: 4px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2); 
    width: 125px; /* Even smaller breadth */
    transition: opacity 0.2s;
  }
  .ws-menu-hidden { display: none !important; }
  
  .ws-btn {
    background: transparent; border: none; padding: 6px 8px;
    text-align: left; cursor: pointer; border-radius: 6px;
    font-size: 12px; color: #111827; display: flex; align-items: center; gap: 6px;
    font-weight: bold; /* Bold Option Text */
    transition: background 0.2s; width: 100%;
  }
  .ws-btn:hover { background: #f3f4f6; }
  .ws-btn.ws-active { background: #000000; color: #ffffff; }
  
  .ws-eraser-container { display: none; flex-direction: column; gap: 2px; padding-left: 12px; border-left: 2px solid #000000; margin-left: 8px; }
  .ws-eraser-container.ws-show { display: flex; }
  
  .ws-divider { height: 2px; background: #000000; margin: 4px 0; }
  
  .ws-color-section { display: flex; flex-direction: column; gap: 6px; padding: 4px; font-size: 12px; font-weight: bold; color: #111827; }
  .ws-custom-row { display: flex; align-items: center; justify-content: space-between; }
  .ws-color-row { display: flex; gap: 6px; justify-content: space-between; margin-top: 2px; }
  
  .ws-color-swatch { 
    width: 16px; height: 16px; border-radius: 50%; cursor: pointer; 
    border: 2px solid transparent; transition: transform 0.1s; 
  }
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

// --- 4. DRAG AND DROP HANDLER LOGIC ---
let isDragging = false;
let startX, startY, initialX, initialY;
let hasMoved = false;

toggleBtn.addEventListener('mousedown', (e) => {
  isDragging = true;
  hasMoved = false;
  startX = e.clientX;
  startY = e.clientY;
  
  const rect = wrapper.getBoundingClientRect();
  initialX = rect.left;
  initialY = rect.top;
  
  e.preventDefault(); // Prevents messy browser text highlighting during drag
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
    hasMoved = true;
  }
  
  wrapper.style.left = `${initialX + dx}px`;
  wrapper.style.top = `${initialY + dy}px`;
  wrapper.style.right = 'auto'; // Sever pinning to the right edge
});

document.addEventListener('mouseup', () => {
  if (isDragging && !hasMoved) {
    // Treat as a clean click if the menu barely moved
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
      console.log("Tool active:", currentTool);
    });
  }
  return btn;
};

menu.appendChild(createToolButton('cursor', '🖱️ Cursor'));
menu.appendChild(createToolButton('highlighter', '🖍️ Highlight'));
menu.appendChild(createToolButton('pen', '🖋️ Pen'));
menu.appendChild(createToolButton('note', '📝 Note'));

// Nested Eraser Structure
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

// Actions
const undoBtn = createToolButton('undo', '↩️ Undo', false);
undoBtn.addEventListener('click', () => console.log("Undo triggered"));
const clearBtn = createToolButton('clear-all', '🗑️ Clear all', false);
clearBtn.addEventListener('click', () => console.log("Clear all triggered"));

menu.appendChild(undoBtn);
menu.appendChild(clearBtn);
menu.appendChild(document.createElement('div')).className = 'ws-divider';

// --- 6. ADVANCED COLOR PICKER (Stacked Rows) ---
const colorSection = document.createElement('div');
colorSection.className = 'ws-color-section';

// Row 1: Label + Custom Picker
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
  console.log("Color code:", currentColor);
});
customRow.appendChild(customColorInput);
colorSection.appendChild(customRow);

// Row 2: 4 Basics Matrix
const colorRow = document.createElement('div');
colorRow.className = 'ws-color-row';

const basics = [
  { hex: '#ef4444' }, // Red
  { hex: '#22c55e' }, // Green
  { hex: '#eab308' }, // Yellow
  { hex: '#3b82f6' }  // Blue
];

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
    console.log("Color hex chosen:", currentColor);
  });
  colorRow.appendChild(swatch);
});

colorSection.appendChild(colorRow);
menu.appendChild(colorSection);

// Initialize
updateActiveButton();
document.body.appendChild(wrapper);
console.log("WebScribe Bold Draggable UI Injected!");