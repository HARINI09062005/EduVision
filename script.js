// Audio introduction functionality
const audioIntro = document.getElementById('audio-intro');
const audioText = `Welcome to EduVision, the Braille Bluetooth Keyboard for the blind. 
Our innovative keyboard allows you to type, save, and share content through touch and voice commands. 
Use the navigation menu to explore our features, or try our demo to experience the keyboard firsthand.`;

let speech = new SpeechSynthesisUtterance();
speech.text = audioText;
speech.rate = 0.9;
speech.pitch = 1;

if (audioIntro) {
    audioIntro.addEventListener('click', () => {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speech);
    });
} else {
    console.debug('audioIntro element not found on this page');
}

// Accessibility features
const contrastToggle = document.getElementById('contrast-toggle');
const fontSizeToggle = document.getElementById('font-size-toggle');
const audioOnlyToggle = document.getElementById('audio-only-toggle');

// High contrast mode
if (contrastToggle) {
    contrastToggle.addEventListener('click', () => {
        document.body.setAttribute('data-theme', 
            document.body.getAttribute('data-theme') === 'high-contrast' ? '' : 'high-contrast'
        );
    });
} else console.debug('contrastToggle not found');

// Font size toggle
let currentFontSize = 16;
if (fontSizeToggle) {
    fontSizeToggle.addEventListener('click', () => {
        currentFontSize = currentFontSize === 16 ? 20 : 16;
        document.documentElement.style.setProperty('--font-size-base', `${currentFontSize}px`);
    });
} else console.debug('fontSizeToggle not found');

// Audio only mode
if (audioOnlyToggle) {
    audioOnlyToggle.addEventListener('click', () => {
        const elements = document.querySelectorAll('body > *:not(header)');
        elements.forEach(element => {
            element.style.display = element.style.display === 'none' ? '' : 'none';
        });
    });
} else console.debug('audioOnlyToggle not found');

// Navigation handling
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, current page:', window.location.pathname);
    
    // Handle navigation links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // For the Create page, ensure accessibility controls are initialized
            if (link.getAttribute('href') === 'create.html') {
                console.log('Create link clicked, navigating to Create page');
                
                // Store current accessibility settings in localStorage
                localStorage.setItem('accessibilitySettings', JSON.stringify({
                    theme: document.body.getAttribute('data-theme'),
                    fontSize: currentFontSize,
                    micActive: isMicActive,
                    speakingActive: isSpeakingActive
                }));
                
                // Announce navigation to screen reader
                announceToScreenReader('Navigating to Create page');
            }
        });
    });
    
    // Check if we're on the Create page
    if (window.location.pathname.endsWith('create.html')) {
        console.log('On Create page, initializing Create page functionality');
        
        // Initialize Create page functionality
        if (typeof initCreatePage === 'function') {
            initCreatePage();
        }
        
        // Restore accessibility settings if available
        const savedSettings = localStorage.getItem('accessibilitySettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            // Apply saved settings
            if (settings.theme) {
                document.body.setAttribute('data-theme', settings.theme);
            }
            
            if (settings.fontSize) {
                document.documentElement.style.setProperty('--font-size-base', `${settings.fontSize}px`);
                currentFontSize = settings.fontSize;
            }
            
            // Announce to screen reader
            announceToScreenReader('Create page loaded with accessibility controls');
        }
    } else {
        console.log('On Home page');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Alt + H - Home
    if (e.altKey && e.key === 'h') {
        window.location.href = 'index.html';
    }
    // Alt + M - Main menu
    if (e.altKey && e.key === 'm') {
        document.querySelector('nav').focus();
    }
    // Alt + A - Accessibility options
    if (e.altKey && e.key === 'a') {
        document.querySelector('.footer-section:has(#contrast-toggle)').focus();
    }
    // Alt + C - Create page
    if (e.altKey && e.key === 'c') {
        window.location.href = 'create.html';
    }
});

// Focus management
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('user-is-tabbing');
});

// ARIA live region for dynamic content
const liveRegion = document.createElement('div');
liveRegion.setAttribute('aria-live', 'polite');
liveRegion.setAttribute('aria-atomic', 'true');
liveRegion.classList.add('sr-only');
document.body.appendChild(liveRegion);

// Function to announce changes to screen readers
function announceToScreenReader(message) {
    liveRegion.textContent = message;
}

// Handle focus changes for better screen reader navigation
document.addEventListener('focus', (e) => {
    if (e.target.matches('a, button, input, select, textarea')) {
        announceToScreenReader(e.target.textContent || e.target.value || e.target.getAttribute('aria-label'));
    }
}, true);

// Add keyboard navigation for the skip link
const skipLink = document.querySelector('.skip-link');
if (skipLink) {
    skipLink.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const main = document.getElementById('main-content');
            if (main) main.focus();
        }
    });
} else console.debug('skip-link not found');

// Accessibility Controls
const micToggle = document.getElementById('mic-toggle');
const stopToggle = document.getElementById('stop-toggle');
const speakingToggle = document.getElementById('speaking-toggle');

let isMicActive = false;
let isSpeakingActive = false;

// Microphone toggle
if (micToggle) {
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
                        if (stopToggle) stopToggle.click();
                    } else if (transcript.toLowerCase().includes('speaking mode')) {
                        if (speakingToggle) speakingToggle.click();
                    } else if (transcript.toLowerCase().includes('go to create')) {
                        window.location.href = 'create.html';
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
} else console.debug('micToggle not found');

// Stop toggle
if (stopToggle) {
    stopToggle.addEventListener('click', () => {
        // Stop all audio
        window.speechSynthesis.cancel();
        if (window.webkitSpeechRecognition) {
            window.webkitSpeechRecognition().stop();
        }
        
        // Reset all states
        isMicActive = false;
        isSpeakingActive = false;
        if (micToggle) micToggle.classList.remove('active');
        if (speakingToggle) speakingToggle.classList.remove('active');
        
        announceToScreenReader('All audio stopped');
    });
} else console.debug('stopToggle not found');

// Speaking toggle
if (speakingToggle) {
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
} else console.debug('speakingToggle not found');