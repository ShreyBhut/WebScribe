// src/background.js
import { db } from './firebase.js';
import { doc, setDoc } from 'firebase/firestore';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'auto_save') {
    // 1. Get the URL of the current tab, and encode it to be a valid database ID
    const currentUrl = sender.tab.url.split('?')[0]; // Ignore ?query=params for consistency
    const safeDocId = encodeURIComponent(currentUrl);

    // 2. Save the data to Firestore in the "pages" collection
    setDoc(doc(db, 'pages', safeDocId), request.data, { merge: true })
      .then(() => console.log('WebScribe: Auto-saved to cloud!'))
      .catch((err) => console.error('WebScribe Save Error:', err));
      
    sendResponse({ status: 'success' });
  }
  return true; // Keeps the message channel open for async operations
});