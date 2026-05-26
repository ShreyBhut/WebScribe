const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware
app.use(cors()); // Allows your Chrome Extension to talk to this server
app.use(express.json()); // Allows your server to read JSON data sent to it

// 2. Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 3. Test Route
app.get('/', (req, res) => {
  res.send('WebScribe Backend Server is Running!');
});

// 4. API Endpoint: Save an annotation (Highlight + Note)
// 4. API Endpoint: Save an annotation (Highlight + Note)
app.post('/api/annotations', async (req, res) => {
  try {
    const { url, text, note, color, createdAt } = req.body;

    if (!url || !text) {
      return res.status(400).json({ error: 'URL and text are required' });
    }

    // CORRECTED: Explicitly declaring the keys for note and color
    const annotation = { 
      url: url, 
      text: text, 
      note: note || '', 
      color: color || '#ffeb3b', 
      createdAt: createdAt || new Date().toISOString() 
    };
    
    // Saves inside a collection called "annotations" in Firestore
    const docRef = await db.collection('annotations').add(annotation);
    
    res.status(201).json({ id: docRef.id, message: 'Annotation saved successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. API Endpoint: Get all annotations for a specific webpage
app.get('/api/annotations', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL query parameter is required' });
    }

    const snapshot = await db.collection('annotations').where('url', '==', url).get();
    
    const annotations = [];
    snapshot.forEach(doc => {
      annotations.push({ id: doc.id, ...doc.data() });
    });

    res.json(annotations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});