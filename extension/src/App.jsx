import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import './App.css';

function App() {
  const [isActive, setIsActive] = useState(true);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Load the saved state when the popup opens
  useEffect(() => {
    /* global chrome */
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['webScribeActive'], (result) => {
        if (result.webScribeActive !== undefined) {
          setIsActive(result.webScribeActive);
        }
      });
    }
    
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, 'pages'));
      const fetchedPages = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const docId = docSnap.id;
        let decodedUrl = '';
        try {
          decodedUrl = decodeURIComponent(docId);
        } catch (e) {
          decodedUrl = docId;
        }

        // Check if there are any actual annotations
        let strokesCount = 0;
        if (data.strokes) {
          const uniqueIds = new Set();
          let legacyCount = 0;
          data.strokes.forEach((stroke) => {
            if (stroke.id) {
              uniqueIds.add(stroke.id);
            } else {
              legacyCount++;
            }
          });
          strokesCount = uniqueIds.size + legacyCount;
        }
        const notesCount = data.notes?.length || 0;
        const highlightsCount = data.highlights?.length || 0;

        if (strokesCount > 0 || notesCount > 0 || highlightsCount > 0) {
          fetchedPages.push({
            id: docId,
            url: decodedUrl,
            title: data.title || decodedUrl,
            updatedAt: data.updatedAt || Date.now(),
            strokesCount,
            notesCount,
            highlightsCount
          });
        }
      });

      // Sort by updatedAt descending (newest first)
      fetchedPages.sort((a, b) => b.updatedAt - a.updatedAt);
      setPages(fetchedPages);
    } catch (err) {
      console.error('WebScribe Fetch Error:', err);
      setError('Failed to sync with Firebase.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSwitch = () => {
    const newState = !isActive;
    setIsActive(newState);
    
    // Save state so it remembers your choice
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ webScribeActive: newState });
    }

    // Send the kill/revive signal to the content script in the active tab
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle_extension', isActive: newState });
        }
      });
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent navigating to the URL
    try {
      await deleteDoc(doc(db, 'pages', id));
      setPages(pages.filter(page => page.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Delete Error:', err);
      setError('Failed to delete annotations.');
    }
  };

  const handleLinkClick = (url, e) => {
    e.preventDefault();
    /* global chrome */
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Filtered pages based on search
  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="popup-container">
      {/* Header with toggle */}
      <header className="popup-header">
        <div className="logo-section">
          <span className="logo-emoji">✏️</span>
          <h1 className="logo-title">WebScribe</h1>
        </div>
        <div className="toggle-container">
          <label className="switch">
            <input type="checkbox" checked={isActive} onChange={toggleSwitch} />
            <span className="slider round"></span>
          </label>
          <span className="toggle-indicator">{isActive ? 'Active' : 'Paused'}</span>
        </div>
      </header>

      {/* Main Dashboard Area */}
      <main className="popup-main">
        <div className="dashboard-title-row">
          <h2 className="section-title">My WebScribes</h2>
          {pages.length > 0 && <span className="total-badge">{pages.length}</span>}
        </div>

        {/* Search Bar */}
        {pages.length > 0 && (
          <div className="search-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input 
              type="text" 
              placeholder="Search annotated pages..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                &times;
              </button>
            )}
          </div>
        )}

        {/* Content States */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Retrieving notes...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="error-message">{error}</p>
            <button className="retry-btn" onClick={fetchPages}>Retry</button>
          </div>
        ) : pages.length === 0 ? (
          <div className="empty-container">
            <div className="empty-graphic">📝</div>
            <p className="empty-title">No annotations yet</p>
            <p className="empty-text">Highlight text or leave sticky notes on any website to see them here.</p>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="empty-container">
            <div className="empty-graphic">🔍</div>
            <p className="empty-title">No results found</p>
            <p className="empty-text">Try searching for a different keyword or URL.</p>
          </div>
        ) : (
          <div className="pages-list">
            {filteredPages.map(page => (
              <div 
                key={page.id} 
                className="page-item"
                onClick={(e) => handleLinkClick(page.url, e)}
              >
                <div className="page-header-row">
                  <h3 className="page-item-title" title={page.title}>{page.title}</h3>
                  <div className="page-actions" onClick={(e) => e.stopPropagation()}>
                    {confirmDeleteId === page.id ? (
                      <div className="confirm-delete-group">
                        <button 
                          className="action-btn confirm-btn" 
                          title="Confirm Delete"
                          onClick={(e) => handleDelete(page.id, e)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                        <button 
                          className="action-btn cancel-btn" 
                          title="Cancel"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="action-btn delete-btn" 
                        title="Delete Annotations"
                        onClick={() => setConfirmDeleteId(page.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <p className="page-item-url" title={page.url}>{page.url}</p>

                <div className="page-meta-row">
                  <span className="page-time">{formatTimeAgo(page.updatedAt)}</span>
                  <div className="page-badges">
                    {page.highlightsCount > 0 && (
                      <span className="stat-badge highlight-badge" title="Highlights">
                        <span className="badge-emoji">🖍️</span> {page.highlightsCount}
                      </span>
                    )}
                    {page.notesCount > 0 && (
                      <span className="stat-badge note-badge" title="Sticky Notes">
                        <span className="badge-emoji">📝</span> {page.notesCount}
                      </span>
                    )}
                    {page.strokesCount > 0 && (
                      <span className="stat-badge pen-badge" title="Drawings">
                        <span className="badge-emoji">🖋️</span> {page.strokesCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <footer className="popup-footer">
        <p className="footer-tip">Tip: Click a page link to jump back to your notes!</p>
      </footer>
    </div>
  );
}

export default App;