// Create Page Functionality
console.log('Create.js script loaded');

// DOM Elements
const searchInput = document.getElementById('search-input');
const voiceSearchBtn = document.getElementById('voice-search');
const uploadBtn = document.getElementById('upload-btn');
const fileUpload = document.getElementById('file-upload');
const createBtn = document.getElementById('create-btn');
const documentsList = document.querySelector('.documents-list');

console.log('DOM elements selected:', {
    searchInput: searchInput,
    voiceSearchBtn: voiceSearchBtn,
    uploadBtn: uploadBtn,
    fileUpload: fileUpload,
    createBtn: createBtn,
    documentsList: documentsList
});

// Accessibility Controls
const micToggle = document.getElementById('mic-toggle');
const stopToggle = document.getElementById('stop-toggle');
const speakingToggle = document.getElementById('speaking-toggle');

let isMicActive = false;
let isSpeakingActive = false;

// Sample recent documents data (would be fetched from server in a real app)
const recentDocuments = [
    { id: 1, name: 'Braille Keyboard User Guide.docx', date: '2023-06-15 14:30' },
    { id: 2, name: 'Accessibility Features Overview.txt', date: '2023-06-14 09:15' },
    { id: 3, name: 'Voice Commands Reference.pdf', date: '2023-06-12 16:45' },
    { id: 4, name: 'Keyboard Layout Diagram.pdf', date: '2023-06-10 11:20' },
    { id: 5, name: 'Braille Training Exercises.docx', date: '2023-06-08 13:40' },
    { id: 6, name: 'User Feedback Summary.txt', date: '2023-06-05 10:30' },
    { id: 7, name: 'Product Specifications.pdf', date: '2023-06-03 15:20' },
    { id: 8, name: 'Installation Guide.docx', date: '2023-06-01 09:45' },
    { id: 9, name: 'Troubleshooting Manual.pdf', date: '2023-05-28 11:30' },
    { id: 10, name: 'Keyboard Shortcuts Reference.txt', date: '2023-05-25 14:20' },
    { id: 11, name: 'Braille Patterns Guide.pdf', date: '2023-05-22 16:15' },
    { id: 12, name: 'Accessibility Standards.docx', date: '2023-05-20 10:45' },
    { id: 13, name: 'User Testimonials.txt', date: '2023-05-18 13:30' },
    { id: 14, name: 'Product Roadmap.pdf', date: '2023-05-15 15:20' },
    { id: 15, name: 'Marketing Materials.pptx', date: '2023-05-12 09:10' }
];

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
    
    // Render recent documents
    renderRecentDocuments();
    
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
    micToggle.addEventListener('click', () => {
        isMicActive = !isMicActive;
        micToggle.classList.toggle('active');
        
        if (isMicActive) {
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
                        stopToggle.click();
                    } else if (transcript.toLowerCase().includes('speaking mode')) {
                        speakingToggle.click();
                    } else if (transcript.toLowerCase().includes('upload file')) {
                        fileUpload.click();
                    } else if (transcript.toLowerCase().includes('new file')) {
                        createNewDocument();
                    } else if (transcript.toLowerCase().includes('search for')) {
                        const searchTerm = transcript.toLowerCase().replace('search for', '').trim();
                        searchInput.value = searchTerm;
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

    // Stop toggle
    stopToggle.addEventListener('click', () => {
        // Stop all audio
        window.speechSynthesis.cancel();
        if (window.webkitSpeechRecognition) {
            window.webkitSpeechRecognition().stop();
        }
        
        // Reset all states
        isMicActive = false;
        isSpeakingActive = false;
        micToggle.classList.remove('active');
        speakingToggle.classList.remove('active');
        
        announceToScreenReader('All audio stopped');
    });

    // Speaking toggle
    speakingToggle.addEventListener('click', () => {
        isSpeakingActive = !isSpeakingActive;
        speakingToggle.classList.toggle('active');
        
        if (isSpeakingActive) {
            // Start speaking mode
            const textToSpeak = document.body.textContent;
            window.speechSynthesis.cancel();
            const speech = new SpeechSynthesisUtterance(textToSpeak);
            speech.rate = 0.9;
            speech.pitch = 1;
            window.speechSynthesis.speak(speech);
            announceToScreenReader('Speaking mode activated');
        } else {
            // Stop speaking mode
            window.speechSynthesis.cancel();
            announceToScreenReader('Speaking mode deactivated');
        }
    });
}

// Render recent documents
function renderRecentDocuments() {
    console.log('Rendering recent documents');
    console.log('Documents list element:', documentsList);
    console.log('Number of documents:', recentDocuments.length);
    
    documentsList.innerHTML = '';
    
    if (recentDocuments.length === 0) {
        console.log('No documents found');
        const noDocs = document.createElement('div');
        noDocs.className = 'document-item';
        noDocs.textContent = 'No documents found';
        noDocs.setAttribute('role', 'status');
        documentsList.appendChild(noDocs);
        return;
    }
    
    recentDocuments.forEach(doc => {
        console.log('Creating document item for:', doc.name);
        const docItem = document.createElement('div');
        docItem.className = 'document-item';
        docItem.setAttribute('role', 'listitem');
        docItem.setAttribute('tabindex', '0');
        docItem.setAttribute('aria-label', `${doc.name}, last opened ${doc.date}`);
        
        // Get file extension to determine icon
        const fileExt = doc.name.split('.').pop().toLowerCase();
        let fileIcon = '📄'; // Default icon
        
        // Set appropriate icon based on file extension
        if (fileExt === 'pdf') {
            fileIcon = '📕';
        } else if (fileExt === 'docx' || fileExt === 'doc') {
            fileIcon = '📘';
        } else if (fileExt === 'txt') {
            fileIcon = '📝';
        } else if (fileExt === 'xlsx' || fileExt === 'xls') {
            fileIcon = '📊';
        } else if (fileExt === 'pptx' || fileExt === 'ppt') {
            fileIcon = '📑';
        }
        
        docItem.innerHTML = `
            <div class="document-info">
                <div class="document-name">
                    <span style="font-size: 1.5rem; margin-right: 10px;">${fileIcon}</span>
                    ${doc.name}
                </div>
                <div class="document-date">Last opened: ${doc.date}</div>
            </div>
            <div class="document-actions">
                <button class="document-action-btn" aria-label="Open ${doc.name}">
                    <span class="icon">📄</span>
                </button>
                <button class="document-action-btn" aria-label="Share ${doc.name}">
                    <span class="icon">📤</span>
                </button>
                <button class="document-action-btn" aria-label="Delete ${doc.name}">
                    <span class="icon">🗑️</span>
                </button>
            </div>
        `;
        
        // Add keyboard navigation
        docItem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openDocument(doc.id);
            }
        });
        
        documentsList.appendChild(docItem);
    });
    
    console.log('Finished rendering documents');
}

// Set up event listeners
function setupEventListeners() {
    // Search input
    searchInput.addEventListener('input', handleSearch);
    
    // Voice search
    voiceSearchBtn.addEventListener('click', activateVoiceSearch);
    
    // File upload
    uploadBtn.addEventListener('click', () => {
        fileUpload.click();
    });
    
    fileUpload.addEventListener('change', handleFileUpload);
    
    // Create new document
    createBtn.addEventListener('click', createNewDocument);
    
    // Document actions
    documentsList.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('.document-action-btn');
        if (!actionBtn) return;
        
        const docItem = actionBtn.closest('.document-item');
        const docName = docItem.querySelector('.document-name').textContent;
        
        if (actionBtn.getAttribute('aria-label').includes('Open')) {
            openDocument(docName);
        } else if (actionBtn.getAttribute('aria-label').includes('Share')) {
            shareDocument(docName);
        } else if (actionBtn.getAttribute('aria-label').includes('Delete')) {
            deleteDocument(docName);
        }
    });
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    // Filter documents
    const filteredDocs = recentDocuments.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm)
    );
    
    // Update UI with filtered results
    renderFilteredDocuments(filteredDocs);
    
    // Announce to screen reader
    announceToScreenReader(`Searching for ${searchTerm}`);
}

// Render filtered documents
function renderFilteredDocuments(filteredDocs) {
    documentsList.innerHTML = '';
    
    if (filteredDocs.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'document-item';
        noResults.textContent = 'No documents found';
        noResults.setAttribute('role', 'status');
        documentsList.appendChild(noResults);
        return;
    }
    
    filteredDocs.forEach(doc => {
        const docItem = document.createElement('div');
        docItem.className = 'document-item';
        docItem.setAttribute('role', 'listitem');
        docItem.setAttribute('tabindex', '0');
        docItem.setAttribute('aria-label', `${doc.name}, last opened ${doc.date}`);
        
        // Get file extension to determine icon
        const fileExt = doc.name.split('.').pop().toLowerCase();
        let fileIcon = '📄'; // Default icon
        
        // Set appropriate icon based on file extension
        if (fileExt === 'pdf') {
            fileIcon = '📕';
        } else if (fileExt === 'docx' || fileExt === 'doc') {
            fileIcon = '📘';
        } else if (fileExt === 'txt') {
            fileIcon = '📝';
        } else if (fileExt === 'xlsx' || fileExt === 'xls') {
            fileIcon = '📊';
        } else if (fileExt === 'pptx' || fileExt === 'ppt') {
            fileIcon = '📑';
        }
        
        docItem.innerHTML = `
            <div class="document-info">
                <div class="document-name">
                    <span style="font-size: 1.5rem; margin-right: 10px;">${fileIcon}</span>
                    ${doc.name}
                </div>
                <div class="document-date">Last opened: ${doc.date}</div>
            </div>
            <div class="document-actions">
                <button class="document-action-btn" aria-label="Open ${doc.name}">
                    <span class="icon">📄</span>
                </button>
                <button class="document-action-btn" aria-label="Share ${doc.name}">
                    <span class="icon">📤</span>
                </button>
                <button class="document-action-btn" aria-label="Delete ${doc.name}">
                    <span class="icon">🗑️</span>
                </button>
            </div>
        `;
        
        documentsList.appendChild(docItem);
    });
}

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
    
    // In a real app, this would upload the file to a server
    // For now, we'll just add it to our recent documents
    const newDoc = {
        id: recentDocuments.length + 1,
        name: file.name,
        date: new Date().toLocaleString()
    };
    
    recentDocuments.unshift(newDoc);
    renderRecentDocuments();
    
    announceToScreenReader(`File ${file.name} uploaded successfully`);
}

// Create new document
function createNewDocument() {
    // In a real app, this would open a document editor
    // For now, we'll just create a sample document
    const newDoc = {
        id: recentDocuments.length + 1,
        name: 'New Document.txt',
        date: new Date().toLocaleString()
    };
    
    recentDocuments.unshift(newDoc);
    renderRecentDocuments();
    
    announceToScreenReader('New document created');
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
    // In a real app, this would delete the document from the server
    // For now, we'll just remove it from our list
    const index = recentDocuments.findIndex(doc => doc.name === docName);
    if (index !== -1) {
        recentDocuments.splice(index, 1);
        renderRecentDocuments();
        announceToScreenReader(`Document ${docName} deleted`);
    }
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
            micToggle.click();
        }
        
        // Alt + P - Toggle speaking mode
        if (e.altKey && e.key === 'p') {
            e.preventDefault();
            speakingToggle.click();
        }
        
        // Alt + X - Stop all audio
        if (e.altKey && e.key === 'x') {
            e.preventDefault();
            stopToggle.click();
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