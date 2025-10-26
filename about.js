// About Page Functionality
console.log('About.js script loaded');

// DOM Elements
const voiceButtons = document.querySelectorAll('.voice-btn');
const micToggle = document.getElementById('mic-toggle');
const stopToggle = document.getElementById('stop-toggle');
const speakingToggle = document.getElementById('speaking-toggle');

// Variables
let isMicActive = false;
let isSpeakingActive = false;
let currentSpeech = null;

// Initialize the page
function initAboutPage() {
    console.log('Initializing About page');
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Set up accessibility controls
    setupAccessibilityControls();
    
    // Announce to screen reader
    announceToScreenReader('About page initialized with all accessibility controls');
}

// Set up event listeners
function setupEventListeners() {
    // Voice buttons for team bios and vision statement
    voiceButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Stop any current speech
            if (currentSpeech) {
                window.speechSynthesis.cancel();
            }
            
            // Get the text to speak
            let textToSpeak = '';
            
            // Check if it's the vision statement button
            if (button.closest('.vision-statement')) {
                textToSpeak = document.querySelector('.vision-statement h3').textContent;
            } else {
                // It's a team member bio
                const teamMember = button.closest('.team-member');
                const name = teamMember.querySelector('h3').textContent;
                const role = teamMember.querySelector('.member-role').textContent;
                const bio = teamMember.querySelector('.member-bio').textContent;
                
                textToSpeak = `${name}. ${role}. ${bio}`;
            }
            
            // Speak the text
            speakText(textToSpeak);
            
            // Add active class to button
            button.classList.add('active');
            
            // Remove active class when speech ends
            currentSpeech.onend = () => {
                button.classList.remove('active');
            };
        });
    });
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
                    } else if (transcript.toLowerCase().includes('read vision')) {
                        document.querySelector('.vision-statement .voice-btn').click();
                    } else if (transcript.toLowerCase().includes('read sarah')) {
                        document.querySelectorAll('.voice-btn')[1].click();
                    } else if (transcript.toLowerCase().includes('read michael')) {
                        document.querySelectorAll('.voice-btn')[2].click();
                    } else if (transcript.toLowerCase().includes('read priya')) {
                        document.querySelectorAll('.voice-btn')[3].click();
                    } else if (transcript.toLowerCase().includes('read david')) {
                        document.querySelectorAll('.voice-btn')[4].click();
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
        
        // Remove active class from all voice buttons
        voiceButtons.forEach(button => {
            button.classList.remove('active');
        });
        
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

// Function to speak text
function speakText(text) {
    // Cancel any current speech
    window.speechSynthesis.cancel();
    
    // Create new speech utterance
    currentSpeech = new SpeechSynthesisUtterance(text);
    currentSpeech.rate = 0.9;
    currentSpeech.pitch = 1;
    
    // Speak the text
    window.speechSynthesis.speak(currentSpeech);
}

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

// Set up keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Alt + H - Go to Home
        if (e.altKey && e.key === 'h') {
            e.preventDefault();
            window.location.href = 'index.html';
        }
        
        // Alt + C - Go to Create
        if (e.altKey && e.key === 'c') {
            e.preventDefault();
            window.location.href = 'create.html';
        }
        
        // Alt + A - Go to About
        if (e.altKey && e.key === 'a') {
            e.preventDefault();
            window.location.href = 'about.html';
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
    });
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initAboutPage); 