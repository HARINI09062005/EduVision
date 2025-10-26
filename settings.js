// Settings Page JavaScript

// DOM Elements
const profileImage = document.querySelector('.profile-image img');
const changePhotoBtn = document.querySelector('.change-photo-btn');
const editProfileBtn = document.querySelector('.edit-btn');
const profileName = document.querySelector('.profile-name h3');
const profileEmail = document.querySelector('.profile-email');
const changePasswordBtn = document.querySelector('.change-password-btn');
const logoutBtn = document.querySelector('.logout-btn');
const sendMessageBtn = document.querySelector('.send-message-btn');
const contactForm = document.querySelector('.contact-form');
const faqQuestions = document.querySelectorAll('.faq-question');
const themeOptions = document.querySelectorAll('.theme-option input');
const fontSizeOptions = document.querySelectorAll('.font-size-option input');
const languageSelect = document.querySelector('.language-selector select');
const voiceFeedbackToggle = document.querySelector('#voice-feedback');
const savePreferencesBtn = document.querySelector('.save-preferences-btn');
const resetPreferencesBtn = document.querySelector('.reset-preferences-btn');
const micToggle = document.querySelector('.mic-toggle');
const stopToggle = document.querySelector('.stop-toggle');
const speakingToggle = document.querySelector('.speaking-toggle');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Settings page initialized');
    initSettingsPage();
});

// Initialize settings page
function initSettingsPage() {
    setupEventListeners();
    setupAccessibilityControls();
    loadUserPreferences();
    announceToScreenReader('Settings page loaded. Use Tab key to navigate through settings options.');
}

// Set up event listeners
function setupEventListeners() {
    // Profile section
    changePhotoBtn?.addEventListener('click', handlePhotoChange);
    editProfileBtn?.addEventListener('click', handleProfileEdit);
    changePasswordBtn?.addEventListener('click', handlePasswordChange);
    logoutBtn?.addEventListener('click', handleLogout);

    // Contact section
    sendMessageBtn?.addEventListener('click', toggleContactForm);

    // FAQ section
    faqQuestions.forEach(question => {
        question.addEventListener('click', toggleFAQ);
        const playBtn = question.nextElementSibling.querySelector('.play-answer-btn');
        playBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            playFAQAnswer(question);
        });
    });

    // App preferences
    themeOptions.forEach(option => {
        option.addEventListener('change', handleThemeChange);
    });

    fontSizeOptions.forEach(option => {
        option.addEventListener('change', handleFontSizeChange);
    });

    languageSelect?.addEventListener('change', handleLanguageChange);
    voiceFeedbackToggle?.addEventListener('change', handleVoiceFeedbackChange);
    savePreferencesBtn?.addEventListener('click', savePreferences);
    resetPreferencesBtn?.addEventListener('click', resetPreferences);

    // Contact form
    const form = document.querySelector('.contact-form form');
    form?.addEventListener('submit', handleContactFormSubmit);
}

// Set up accessibility controls
function setupAccessibilityControls() {
    // Microphone toggle
    micToggle?.addEventListener('click', () => {
        const isActive = micToggle.classList.toggle('active');
        if (isActive) {
            startVoiceRecognition();
        } else {
            stopVoiceRecognition();
        }
    });

    // Stop toggle
    stopToggle?.addEventListener('click', () => {
        stopAllAudio();
    });

    // Speaking toggle
    speakingToggle?.addEventListener('click', () => {
        const isActive = speakingToggle.classList.toggle('active');
        if (isActive) {
            startSpeakingMode();
        } else {
            stopSpeakingMode();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Handle profile photo change
function handlePhotoChange() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profileImage.src = event.target.result;
                // Here you would typically upload the image to your server
                announceToScreenReader('Profile photo updated successfully');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

// Handle profile edit
function handleProfileEdit() {
    const currentName = profileName.textContent;
    const currentEmail = profileEmail.textContent;
    
    const newName = prompt('Enter your name:', currentName);
    const newEmail = prompt('Enter your email:', currentEmail);
    
    if (newName && newEmail) {
        profileName.textContent = newName;
        profileEmail.textContent = newEmail;
        // Here you would typically update the profile on your server
        announceToScreenReader('Profile information updated successfully');
    }
}

// Handle password change
function handlePasswordChange() {
    const currentPassword = prompt('Enter your current password:');
    if (currentPassword) {
        const newPassword = prompt('Enter your new password:');
        if (newPassword) {
            const confirmPassword = prompt('Confirm your new password:');
            if (newPassword === confirmPassword) {
                // Here you would typically update the password on your server
                announceToScreenReader('Password updated successfully');
            } else {
                alert('Passwords do not match');
            }
        }
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Here you would typically handle the logout process
        window.location.href = 'index.html';
    }
}

// Toggle contact form
function toggleContactForm() {
    contactForm.classList.toggle('active');
    if (contactForm.classList.contains('active')) {
        announceToScreenReader('Contact form opened. Please fill in your details.');
    }
}

// Handle contact form submission
function handleContactFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    // Here you would typically send the form data to your server
    alert('Message sent successfully!');
    contactForm.classList.remove('active');
    e.target.reset();
    announceToScreenReader('Message sent successfully');
}

// Toggle FAQ
function toggleFAQ(e) {
    const question = e.currentTarget;
    const isExpanded = question.getAttribute('aria-expanded') === 'true';
    
    question.setAttribute('aria-expanded', !isExpanded);
    
    if (!isExpanded) {
        announceToScreenReader(`Expanded: ${question.querySelector('h3').textContent}`);
    }
}

// Play FAQ answer
function playFAQAnswer(question) {
    const answer = question.nextElementSibling.querySelector('p').textContent;
    speakText(answer);
}

// Handle theme change
function handleThemeChange(e) {
    const theme = e.target.value;
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    announceToScreenReader(`Theme changed to ${theme}`);
}

// Handle font size change
function handleFontSizeChange(e) {
    const size = e.target.value;
    document.body.setAttribute('data-font-size', size);
    localStorage.setItem('fontSize', size);
    announceToScreenReader(`Font size changed to ${size}`);
}

// Handle language change
function handleLanguageChange(e) {
    const language = e.target.value;
    // Here you would typically update the language settings
    localStorage.setItem('language', language);
    announceToScreenReader(`Language changed to ${language}`);
}

// Handle voice feedback change
function handleVoiceFeedbackChange(e) {
    const enabled = e.target.checked;
    localStorage.setItem('voiceFeedback', enabled);
    announceToScreenReader(`Voice feedback ${enabled ? 'enabled' : 'disabled'}`);
}

// Save preferences
function savePreferences() {
    // Here you would typically save all preferences to your server
    announceToScreenReader('Preferences saved successfully');
}

// Reset preferences
function resetPreferences() {
    if (confirm('Are you sure you want to reset all preferences to default?')) {
        localStorage.clear();
        loadUserPreferences();
        announceToScreenReader('Preferences reset to default');
    }
}

// Load user preferences
function loadUserPreferences() {
    const theme = localStorage.getItem('theme') || 'light';
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    const language = localStorage.getItem('language') || 'en';
    const voiceFeedback = localStorage.getItem('voiceFeedback') === 'true';

    document.body.setAttribute('data-theme', theme);
    document.body.setAttribute('data-font-size', fontSize);
    languageSelect.value = language;
    voiceFeedbackToggle.checked = voiceFeedback;

    // Set the corresponding radio buttons
    document.querySelector(`input[name="theme"][value="${theme}"]`).checked = true;
    document.querySelector(`input[name="font-size"][value="${fontSize}"]`).checked = true;
}

// Voice recognition functions
function startVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event) => {
            const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
            handleVoiceCommand(command);
        };
        
        recognition.start();
        announceToScreenReader('Voice recognition activated');
    } else {
        alert('Voice recognition is not supported in your browser');
    }
}

function stopVoiceRecognition() {
    // Stop the recognition if it's running
    announceToScreenReader('Voice recognition deactivated');
}

// Handle voice commands
function handleVoiceCommand(command) {
    if (command.includes('open profile')) {
        document.querySelector('.profile-card').scrollIntoView({ behavior: 'smooth' });
    } else if (command.includes('open contact')) {
        document.querySelector('.contact-card').scrollIntoView({ behavior: 'smooth' });
    } else if (command.includes('open faq')) {
        document.querySelector('.faq-container').scrollIntoView({ behavior: 'smooth' });
    } else if (command.includes('open preferences')) {
        document.querySelector('.preferences-card').scrollIntoView({ behavior: 'smooth' });
    }
}

// Speaking mode functions
function startSpeakingMode() {
    document.body.classList.add('speaking-mode');
    announceToScreenReader('Speaking mode activated');
}

function stopSpeakingMode() {
    document.body.classList.remove('speaking-mode');
    announceToScreenReader('Speaking mode deactivated');
}

// Stop all audio
function stopAllAudio() {
    window.speechSynthesis.cancel();
    announceToScreenReader('All audio stopped');
}

// Speak text
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Alt + H: Home
    if (e.altKey && e.key === 'h') {
        window.location.href = 'index.html';
    }
    // Alt + C: Create
    else if (e.altKey && e.key === 'c') {
        window.location.href = 'create.html';
    }
    // Alt + A: About
    else if (e.altKey && e.key === 'a') {
        window.location.href = 'about.html';
    }
    // Alt + M: Toggle microphone
    else if (e.altKey && e.key === 'm') {
        micToggle.click();
    }
    // Alt + P: Toggle speaking mode
    else if (e.altKey && e.key === 'p') {
        speakingToggle.click();
    }
    // Alt + X: Stop all audio
    else if (e.altKey && e.key === 'x') {
        stopToggle.click();
    }
}

// Announce to screen reader
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.classList.add('sr-only');
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
} 