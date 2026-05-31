// src/background.js
import { db } from './firebase.js';
import { doc, setDoc, getDoc } from 'firebase/firestore';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Get the URL and encode it securely to match your database ID
  const currentUrl = sender.tab.url.split('?')[0]; 
  const safeDocId = encodeURIComponent(currentUrl);

  // ACTION: AUTO-SAVE
  if (request.action === 'auto_save') {
    setDoc(doc(db, 'pages', safeDocId), request.data, { merge: true })
      .then(() => sendResponse({ status: 'success' }))
      .catch((err) => console.error('WebScribe Save Error:', err));
    return true; 
  }

  // ACTION: AUTO-LOAD
  if (request.action === 'auto_load') {
    getDoc(doc(db, 'pages', safeDocId))
      .then((docSnap) => {
        if (docSnap.exists()) {
          console.log('WebScribe: Found saved data!');
          sendResponse({ status: 'success', data: docSnap.data() });
        } else {
          console.log('WebScribe: No saved data for this page.');
          sendResponse({ status: 'empty' });
        }
      })
      .catch((err) => console.error('WebScribe Load Error:', err));
    return true; 
  }
});