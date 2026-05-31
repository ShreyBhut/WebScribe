# ✏️ WebScribe - Annotate, Highlight & Draw on Any Webpage
WebScribe is a Chrome extension that lets you highlight text, leave sticky notes, draw with a pen, use a laser pointer, and place shapes — all directly on top of any webpage. Every annotation is automatically saved to Firebase and restored when you revisit the page. WebScribe works on any Chromium-based browser.
## ✨ Features
- **🖍️ Text Highlighting** — Select any text and highlight it with a colour of your choice.
- **📝 Sticky Notes** — Click anywhere on a page to place a draggable, resizable sticky note.
- **🖋️ Freehand Pen** — Draw freehand strokes directly on any webpage with adjustable colours.
- **⬡ Shape Tools** — Drop rectangles, circles, and arrows onto a page.
- **🔴 Laser Pointer** — Present with a neon dot or a fading trail (perfect for screen shares and recordings).
- **🧼 Eraser** — Erase pen strokes normally (pixel-level) or by entire stroke.
- **↩️ Undo / 🔁 Redo** — Full undo/redo history with `Ctrl+Z` / `Ctrl+Y` keyboard shortcuts.
- **🗑️ Clear All** — Wipe all annotations on a page with a confirmation modal.
- **🎨 Colour Picker** — Five quick-access presets plus a full custom colour picker.
- **☁️ Cloud Sync** — All annotations auto-save to Firebase Firestore and auto-load on revisit.
- **📋 Dashboard Popup** — Browse all your annotated pages, see counts of highlights/notes/drawings, search, and delete.
- **⏸️ Master Toggle** — Pause/resume WebScribe from the popup without losing any data.
- **🖱️ Draggable Toolbar** — The on-page toolbar can be dragged to any corner so it never blocks content.
## 🛠 Setting up WebScribe
### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- A Firebase project with Firestore enabled
- A Firebase service account key (`serviceAccountKey.json`) for the backend server
### 1. Clone the Repository
```sh
git clone https://github.com/ShreyBhut/WebScribe.git
cd WebScribe
```
### 2. Set Up the Backend Server
```sh
cd server
npm install
```
Create a `.env` file inside the `server/` folder:
```
PORT=5000
```
Place your Firebase **service account key** file as `server/serviceAccountKey.json`.  
*(This file is gitignored and must be generated from your Firebase Console → Project Settings → Service Accounts.)*
### 3. Set Up the Extension
```sh
cd ../extension
npm install
npm run build
```
### 4. Load the Extension in Your Browser
1. Open your Chromium-based browser and go to `chrome://extensions/`.
2. Enable **"Developer mode"** by clicking the toggle switch in the top right corner.
3. Click **"Load unpacked"** and select the `extension/dist` folder.
4. Pin WebScribe to the toolbar to make it easier to access.
## 🚀 Using WebScribe
### 1. Start the Backend Server
```sh
cd server
node index.js
```
This starts the server on [http://localhost:5000](http://localhost:5000).  
*(You can change the port in the `.env` file if needed.)*
### 2. Annotating a Webpage
Visit any webpage and click the **✏️ WebScribe** toggle in the top-right corner to expand the toolbar. From there you can:
1. **Highlight text** — Select the Highlight tool, then select any text on the page.
2. **Draw with the pen** — Select the Pen tool and draw freehand anywhere.
3. **Place a sticky note** — Select the Note tool and click anywhere on the page.
4. **Draw shapes** — Expand the Shapes sub-menu and choose Rectangle, Circle, or Arrow.
5. **Use the laser pointer** — Expand the Laser sub-menu and choose Dot or Trail mode.
6. **Erase** — Expand the Eraser sub-menu and choose Normal (pixel) or Stroke (whole stroke) mode.
7. **Pick a colour** — Use the preset swatches or the custom colour picker at the bottom of the toolbar.
All annotations are **automatically saved** to Firebase whenever you create, edit, or delete them.
### 3. Managing Annotations from the Popup
Click the WebScribe icon in the Chrome toolbar to open the popup dashboard:
- Browse all your annotated pages sorted by most recently updated.
- See badge counts for highlights 🖍️, sticky notes 📝, and drawings 🖋️.
- **Search** through your annotated pages by title or URL.
- **Delete** all annotations for a page with the trash icon (with confirmation).
- **Toggle** WebScribe on/off using the master switch — your data is preserved even when paused.
- Click any page entry to jump directly to that URL and your annotations will auto-load.
### 4. Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Redo |
## 🧰 Tech Stack
| Component | Technologies |
|---|---|
| **Extension Frontend** | React, Vite, CSS |
| **Content Script** | Vanilla JavaScript, HTML5 Canvas |
| **Background Script** | Chrome Extension APIs, Firebase Firestore |
| **Backend Server** | Node.js, Express, Firebase Admin SDK |
| **Database** | Firebase Cloud Firestore |
| **Build Tool** | Vite |
## 📁 Project Structure
```
WebScribe/
├── extension/                  # Chrome Extension (Frontend)
│   ├── public/
│   │   ├── content.js          # Content script injected into every page
│   │   ├── manifest.json       # Chrome Extension manifest (MV3)
│   │   ├── icon16.png          # Extension icon (16×16)
│   │   ├── icon32.png          # Extension icon (32×32)
│   │   ├── icon48.png          # Extension icon (48×48)
│   │   └── icon128.png         # Extension icon (128×128)
│   ├── src/
│   │   ├── App.jsx             # Popup dashboard (React)
│   │   ├── App.css             # Popup styles
│   │   ├── background.js       # Service worker for auto-save/load via Firebase
│   │   ├── firebase.js         # Firebase client config
│   │   ├── main.jsx            # React entry point
│   │   └── index.css           # Global styles
│   ├── index.html              # Popup HTML shell
│   ├── vite.config.js          # Vite build configuration
│   └── package.json
│
├── server/                     # Backend Server
│   ├── index.js                # Express server with Firestore API
│   ├── serviceAccountKey.json  # Firebase service account (gitignored)
│   ├── .env                    # Environment variables (gitignored)
│   └── package.json
│
├── .gitignore
└── README.md
```
