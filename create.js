// Create Page Functionality
console.log('Create.js script loaded');

// DOM Elements (will be assigned when DOM is ready)
let searchInput;
let voiceSearchBtn;
let uploadBtn;
let fileUpload;
let createBtn;
// documentsList removed (Recent Documents UI removed)

// Accessibility Controls (assigned on init) - use distinct names to avoid global conflicts
let createMicToggle;
let createStopToggle;
let createSpeakingToggle;

// Do not redeclare `isMicActive` or `isSpeakingActive` here — they are declared in `script.js`.
// Use the globals if present.
// Reference to a window opened synchronously on upload click to avoid popup blockers
let pendingViewerWindow = null;

// recentDocuments removed — list UI removed from Create page

// Function to announce messages to screen readers
function announceToScreenReader(message) {
    // Create a live region for announcements
    let announcementRegion = document.getElementById('announcement-region');
    
    if (!announcementRegion) {
        announcementRegion = document.createElement('div');
        announcementRegion.id = 'announcement-region';
        announcementRegion.setAttribute('aria-live', 'polite');
        announcementRegion.setAttribute('aria-atomic', 'true');
        announcementRegion.classList.add('visually-hidden');
        document.body.appendChild(announcementRegion);
    }
    
    // Set the message and clear it after a short delay
    announcementRegion.textContent = message;
    setTimeout(() => {
        announcementRegion.textContent = '';
    }, 3000);
}

// Initialize the page
function initCreatePage() {
    console.log('Initializing Create page');
    // Assign DOM elements now that DOM is loaded
    searchInput = document.getElementById('search-input');
    voiceSearchBtn = document.getElementById('voice-search');
    uploadBtn = document.getElementById('upload-btn');
    fileUpload = document.getElementById('file-upload');
    createBtn = document.getElementById('create-btn');

    createMicToggle = document.getElementById('mic-toggle');
    createStopToggle = document.getElementById('stop-toggle');
    createSpeakingToggle = document.getElementById('speaking-toggle');

    // Recent documents UI removed; nothing to render here

    // Set up event listeners
    setupEventListeners();

    // Set up keyboard shortcuts
    setupKeyboardShortcuts();

    // Set up accessibility controls
    setupAccessibilityControls();

    // Announce to screen reader
    announceToScreenReader('Create page initialized with all accessibility controls');
}

// Set up accessibility controls
function setupAccessibilityControls() {
    // Microphone toggle
    if (createMicToggle) {
        createMicToggle.addEventListener('click', () => {
            // Toggle global state (declared in script.js)
            if (typeof isMicActive === 'undefined') window.isMicActive = false;
            if (typeof isSpeakingActive === 'undefined') window.isSpeakingActive = false;

            window.isMicActive = !window.isMicActive;
            createMicToggle.classList.toggle('active');

            if (window.isMicActive) {
                // Start microphone
                if ('webkitSpeechRecognition' in window) {
                    const recognition = new webkitSpeechRecognition();
                    recognition.continuous = true;
                    recognition.interimResults = true;

                    recognition.onresult = (event) => {
                        const transcript = Array.from(event.results)
                            .map(result => result[0].transcript)
                            .join('');

                        // Handle voice commands
                        if (transcript.toLowerCase().includes('read page')) {
                            window.speechSynthesis.speak(document.body.textContent);
                        } else if (transcript.toLowerCase().includes('stop')) {
                            if (createStopToggle) createStopToggle.click();
                        } else if (transcript.toLowerCase().includes('speaking mode')) {
                            if (createSpeakingToggle) createSpeakingToggle.click();
                        } else if (transcript.toLowerCase().includes('upload file')) {
                            if (fileUpload) fileUpload.click();
                        } else if (transcript.toLowerCase().includes('new file')) {
                            createNewDocument();
                        } else if (transcript.toLowerCase().includes('search for')) {
                            const searchTerm = transcript.toLowerCase().replace('search for', '').trim();
                            if (searchInput) searchInput.value = searchTerm;
                            handleSearch({ target: { value: searchTerm } });
                        } else if (transcript.toLowerCase().includes('go to home')) {
                            window.location.href = 'index.html';
                        }
                    };

                    recognition.start();
                    announceToScreenReader('Microphone activated');
                } else {
                    announceToScreenReader('Speech recognition not supported in this browser');
                }
            } else {
                // Stop microphone
                if (window.webkitSpeechRecognition) {
                    window.webkitSpeechRecognition().stop();
                }
                announceToScreenReader('Microphone deactivated');
            }
        });
    } else console.warn('createMicToggle not found');

    // Stop toggle
    if (createStopToggle) {
        createStopToggle.addEventListener('click', () => {
        // Stop all audio
        window.speechSynthesis.cancel();
        if (window.webkitSpeechRecognition) {
            window.webkitSpeechRecognition().stop();
        }
        
        // Reset all states
        window.isMicActive = false;
        window.isSpeakingActive = false;
        if (createMicToggle) createMicToggle.classList.remove('active');
        if (createSpeakingToggle) createSpeakingToggle.classList.remove('active');
        
        announceToScreenReader('All audio stopped');
    });
    } else console.warn('createStopToggle not found');

    // Speaking toggle
    if (createSpeakingToggle) {
        createSpeakingToggle.addEventListener('click', () => {
            if (typeof isSpeakingActive === 'undefined') window.isSpeakingActive = false;
            window.isSpeakingActive = !window.isSpeakingActive;
            createSpeakingToggle.classList.toggle('active');

            if (window.isSpeakingActive) {
                const textToSpeak = document.body.textContent;
                window.speechSynthesis.cancel();
                const speech = new SpeechSynthesisUtterance(textToSpeak);
                speech.rate = 0.9;
                speech.pitch = 1;
                window.speechSynthesis.speak(speech);
                announceToScreenReader('Speaking mode activated');
            } else {
                window.speechSynthesis.cancel();
                announceToScreenReader('Speaking mode deactivated');
            }
        });
    } else console.warn('createSpeakingToggle not found');
}

// Render recent documents
function renderRecentDocuments() {
    // renderRecentDocuments removed — Recent Documents UI no longer exists on this page
}

// Set up event listeners
function setupEventListeners() {
    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    } else console.warn('searchInput not found');

    // Voice search
    if (voiceSearchBtn) {
        voiceSearchBtn.addEventListener('click', activateVoiceSearch);
    } else console.warn('voiceSearchBtn not found');

    // File upload
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            // Open a blank window synchronously to avoid popup blockers when we later navigate to the viewer
            try {
                pendingViewerWindow = window.open('', '_blank');
                if (pendingViewerWindow) {
                    // Write a temporary loading message
                    pendingViewerWindow.document.write('<!doctype html><html><head><title>Loading...</title></head><body><p>Preparing document viewer...</p></body></html>');
                }
            } catch (err) {
                console.warn('Could not open viewer window synchronously', err);
                pendingViewerWindow = null;
            }

            if (fileUpload) {
                fileUpload.click();
            } else {
                console.warn('fileUpload input not found');
            }
        });
    } else console.warn('uploadBtn not found');

    if (fileUpload) {
        fileUpload.addEventListener('change', handleFileUpload);
    }

    // Create new document
    if (createBtn) {
        createBtn.addEventListener('click', createNewDocument);
    } else console.warn('createBtn not found');
    
    // No document list on this page any more.
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    // Recent documents removed: there's no document list to filter.
    // We keep accessibility feedback so the user knows their query was captured.
    announceToScreenReader(`Search query received: ${searchTerm}.`);
}

// Render filtered documents
// renderFilteredDocuments removed — no documents list to render

// Activate voice search
function activateVoiceSearch() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => {
            voiceSearchBtn.classList.add('active');
            announceToScreenReader('Listening for search term');
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            searchInput.value = transcript;
            handleSearch({ target: { value: transcript } });
            announceToScreenReader(`Searching for ${transcript}`);
        };
        
        recognition.onend = () => {
            voiceSearchBtn.classList.remove('active');
        };
        
        recognition.start();
    } else {
        announceToScreenReader('Speech recognition not supported in this browser');
    }
}

// Handle file upload
function handleFileUpload(e) {
    const files = e.target.files;
    if (files.length === 0) return;
    
    const file = files[0];
    
    // In a real app, this would upload the file to a server.
    // We no longer maintain a Recent Documents list on this page; proceed to viewer.

    // Determine file type and try to read text content when possible
    const nameLower = file.name.toLowerCase();
    const ext = nameLower.split('.').pop();

    // Helper to store doc in localStorage and open viewer
    function openInViewer(name, content, fileUrl) {
        const key = `eduvision_doc_${Date.now()}`;
        const payload = { name, content: content || null, fileUrl: fileUrl || null };
        try {
            localStorage.setItem(key, JSON.stringify(payload));
            // Open viewer in new tab and pass the storage key
            if (pendingViewerWindow && !pendingViewerWindow.closed) {
                try {
                    pendingViewerWindow.location = `view.html?docKey=${encodeURIComponent(key)}`;
                    pendingViewerWindow.focus();
                    pendingViewerWindow = null;
                } catch (err) {
                    // If navigation fails, fallback to opening a new window
                    window.open(`view.html?docKey=${encodeURIComponent(key)}`, '_blank');
                }
            } else {
                window.open(`view.html?docKey=${encodeURIComponent(key)}`, '_blank');
                pendingViewerWindow = null;
            }
        } catch (err) {
            console.error('Failed to save document for viewing', err);
            announceToScreenReader('Unable to open document in viewer');
        }
    }

    if (file.type.startsWith('text') || ext === 'txt' || ext === 'md' || ext === 'csv') {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target.result;
            announceToScreenReader(`File ${file.name} uploaded and opening in viewer`);
            openInViewer(file.name, text, null);
        };
        reader.onerror = () => {
            announceToScreenReader('Failed to read file');
        };
        reader.readAsText(file);
    } else {
        // For non-text files we provide a downloadable blob URL and open the viewer with a notice
        const blobUrl = URL.createObjectURL(file);
        announceToScreenReader(`File ${file.name} uploaded. Preview not available for this file type. Opening viewer with download link.`);
        openInViewer(file.name, null, blobUrl);
    }
}

// Create new document
function createNewDocument() {
    // In a real app, this would open a document editor. For now, announce the action.
    announceToScreenReader('Create new document requested');
}

// Open document
function openDocument(docId) {
    // In a real app, this would open the document in an editor
    announceToScreenReader(`Opening document ${docId}`);
}

// Share document
function shareDocument(docName) {
    // In a real app, this would open a sharing dialog
    announceToScreenReader(`Sharing document ${docName}`);
}

// Delete document
function deleteDocument(docName) {
    // Recent documents removed — delete is a no-op here. Announce for accessibility.
    announceToScreenReader(`Delete requested for ${docName}. Document list has been removed.`);
}

// Set up keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl + F or Alt + S - Focus search
        if ((e.ctrlKey && e.key === 'f') || (e.altKey && e.key === 's')) {
            e.preventDefault();
            searchInput.focus();
        }
        
        // Alt + U - Upload file
        if (e.altKey && e.key === 'u') {
            e.preventDefault();
            fileUpload.click();
        }
        
        // Alt + N - New document
        if (e.altKey && e.key === 'n') {
            e.preventDefault();
            createNewDocument();
        }
        
        // Alt + M - Toggle microphone
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            if (createMicToggle) createMicToggle.click();
        }
        
        // Alt + P - Toggle speaking mode
        if (e.altKey && e.key === 'p') {
            e.preventDefault();
            if (createSpeakingToggle) createSpeakingToggle.click();
        }
        
        // Alt + X - Stop all audio
        if (e.altKey && e.key === 'x') {
            e.preventDefault();
            if (createStopToggle) createStopToggle.click();
        }
        
        // Alt + H - Go to home page
        if (e.altKey && e.key === 'h') {
            e.preventDefault();
            window.location.href = 'index.html';
        }
    });
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initCreatePage); 