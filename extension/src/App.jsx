import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isActive, setIsActive] = useState(true);

  // Load the saved state when the popup opens
  useEffect(() => {
    /* global chrome */
    chrome.storage.local.get(['webScribeActive'], (result) => {
      if (result.webScribeActive !== undefined) {
        setIsActive(result.webScribeActive);
      }
    });
  }, []);

  const toggleSwitch = () => {
    const newState = !isActive;
    setIsActive(newState);
    
    // Save state so it remembers your choice
    chrome.storage.local.set({ webScribeActive: newState });

    // Send the kill/revive signal to the content script in the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle_extension', isActive: newState });
      }
    });
  };

  return (
    <div className="popup-container">
      <h2 className="popup-title">✏️ WebScribe</h2>
      
      <div className="toggle-wrapper">
        <span className="toggle-label">{isActive ? 'Active' : 'Disabled'}</span>
        <label className="switch">
          <input type="checkbox" checked={isActive} onChange={toggleSwitch} />
          <span className="slider round"></span>
        </label>
      </div>
      
      <p className="popup-hint">
        {isActive ? "WebScribe is running on this page." : "All annotations are hidden."}
      </p>
    </div>
  );
}

export default App;