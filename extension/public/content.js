// --- 1. STATE MANAGEMENT ---
let currentTool = 'cursor';
let currentColor = '#ffeb3b';
let isMenuOpen = true;
let isEraserOpen = false;
let actionHistory = []; 
let redoHistory = []; 

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
  .ws-btn-confirm { background: #ef4444; color: #ffffff; }
  .ws-btn-confirm:hover { background: #dc2626; box-shadow: 2px 2px 0 #000000; transform: translate(-2px, -2px); }

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
// --- 7. THE UNIFIED VECTOR CANVAS ENGINE ---
// ==========================================

const canvas = document.createElement('canvas');
canvas.id = 'ws-canvas';
canvas.style.cssText = `position: absolute; top: 0; left: 0; z-index: 999998; pointer-events: none;`;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

let strokes = [];       
let currentStroke = null; 
let snapshotBeforeDraw = []; 

const drawSingleStroke = (stroke) => {
  if (stroke.points.length < 1) return;
  ctx.beginPath();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (stroke.tool === 'pen') {
    ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = stroke.color; ctx.lineWidth = 4;
  } else if (stroke.tool === 'eraser-normal') {
    ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = 25;
  }
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let i = 1; i < stroke.points.length; i++) { ctx.lineTo(stroke.points[i].x, stroke.points[i].y); }
  ctx.stroke();
};

const redrawCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  strokes.forEach(stroke => drawSingleStroke(stroke));
  if (currentStroke) drawSingleStroke(currentStroke);
};

const resizeCanvas = () => {
  canvas.width = document.documentElement.scrollWidth; canvas.height = document.documentElement.scrollHeight; redrawCanvas(); 
};
resizeCanvas(); window.addEventListener('resize', resizeCanvas);

const updateCanvasInteractivity = () => {
  if (['pen', 'eraser-normal', 'eraser-stroke'].includes(currentTool)) { canvas.style.pointerEvents = 'auto'; } 
  else { canvas.style.pointerEvents = 'none'; }
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

// --- DRAWING MOUSE EVENTS ---
let isDrawingCanvas = false;

canvas.addEventListener('mousedown', (e) => {
  if (!['pen', 'eraser-normal', 'eraser-stroke'].includes(currentTool)) return;
  
  snapshotBeforeDraw = JSON.parse(JSON.stringify(strokes)); 
  
  if (currentTool === 'pen' || currentTool === 'eraser-normal') {
    isDrawingCanvas = true;
    currentStroke = { tool: currentTool, color: currentColor, points: [{ x: e.pageX, y: e.pageY }] };
    redrawCanvas();
  } else if (currentTool === 'eraser-stroke') {
    checkStrokeIntersection(e.pageX, e.pageY);
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (currentTool === 'eraser-stroke') {
     if (e.buttons !== 1) return;
     checkStrokeIntersection(e.pageX, e.pageY);
  }
  
  if (!isDrawingCanvas) return;
  
  if (currentTool === 'pen' || currentTool === 'eraser-normal') {
    currentStroke.points.push({ x: e.pageX, y: e.pageY });

    if (currentTool === 'eraser-normal') {
      const eraserRadius = 15; 
      for (let i = strokes.length - 1; i >= 0; i--) {
        const stroke = strokes[i];
        if (stroke.tool !== 'pen') continue;
        let newStrokes = []; let currentSegment = [];
        for (let j = 0; j < stroke.points.length; j++) {
          const pt = stroke.points[j];
          if (Math.hypot(pt.x - e.pageX, pt.y - e.pageY) > eraserRadius) { currentSegment.push(pt); } 
          else {
            if (currentSegment.length > 0) { newStrokes.push({ tool: 'pen', color: stroke.color, points: currentSegment }); currentSegment = []; }
          }
        }
        if (currentSegment.length > 0) newStrokes.push({ tool: 'pen', color: stroke.color, points: currentSegment });
        if (newStrokes.length !== 1 || newStrokes[0].points.length !== stroke.points.length) { strokes.splice(i, 1, ...newStrokes); }
      }
    }
    redrawCanvas();
  } 
});

canvas.addEventListener('mouseup', () => {
  if (isDrawingCanvas || currentTool === 'eraser-stroke') { 
    if (isDrawingCanvas && currentStroke) { 
      strokes.push(currentStroke); 
      currentStroke = null; 
    }
    isDrawingCanvas = false; 
    redrawCanvas();
    
    // Save current strokes state alongside previous state for Redo logic
    actionHistory.push({ type: 'canvas', previousStrokes: snapshotBeforeDraw, currentStrokes: JSON.parse(JSON.stringify(strokes)) });
    redoHistory = []; // Wipe redo stack when a new action is performed
  }
});


// ==========================================
// --- 8. THE DOM ENGINE ---
// ==========================================

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
        if (highlight) { highlight.replaceWith(...highlight.childNodes); }
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
    closeBtn.addEventListener('click', () => note.remove());

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
      h.style.backgroundColor = h.dataset.bgColor || '#ffeb3b66';
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

  // 3. Send payload to background.js
  chrome.runtime.sendMessage({
    action: 'auto_save',
    data: { 
      strokes: dataStrokes, 
      notes: dataNotes 
    }
  });
};

// --- BIND TRIGGERS ---
// Listen for canvas drawing completion
canvas.addEventListener('mouseup', () => {
  if (['pen', 'eraser-normal', 'eraser-stroke'].includes(currentTool)) {
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