// view.js - display uploaded document and provide speak/stop controls
(() => {
    const params = new URLSearchParams(window.location.search);
    const docKey = params.get('docKey');

    const docTitleEl = document.getElementById('doc-title');
    const docContentEl = document.getElementById('doc-content');
    const downloadLinkEl = document.getElementById('download-link');

    let currentUtterance = null;
    let wordSpans = [];
    let currentHighlighted = null;

    function announceToScreenReader(msg) {
        // Announcements are intentionally silenced in the viewer to avoid
        // redundant or noisy screen reader output (e.g., "Speaking document",
        // "Finished speaking", "No text available").
        // Keep this function present so calls are no-ops.
    }

    function loadDocument() {
        if (!docKey) {
            docTitleEl.textContent = 'No document specified';
            docContentEl.textContent = 'Missing document key.';
            return;
        }

        const raw = localStorage.getItem(docKey);
        if (!raw) {
            docTitleEl.textContent = 'Document not found';
            docContentEl.textContent = 'The requested document could not be found in local storage. It may have been removed.';
            return;
        }

        try {
            const payload = JSON.parse(raw);
            const { name, content, fileUrl } = payload;
            docTitleEl.textContent = name || 'Document';

            if (content) {
                renderContentWithSpans(content);
                downloadLinkEl.innerHTML = '';
            } else if (fileUrl) {
                docContentEl.textContent = 'Preview not available for this file type.';
                downloadLinkEl.innerHTML = `<a href="${fileUrl}" download="${name}">Download ${name}</a>`;
            } else {
                docContentEl.textContent = 'No preview available.';
            }

            // Optionally remove item from localStorage after reading
            // localStorage.removeItem(docKey);
        } catch (err) {
            console.error('Failed to parse document payload', err);
            docTitleEl.textContent = 'Error loading document';
            docContentEl.textContent = 'Unable to load the document content.';
        }
    }

    // Render content into word-level spans so we can highlight the currently spoken word
    function renderContentWithSpans(text) {
        wordSpans = [];
        currentHighlighted = null;

        const container = document.createElement('div');
        let idx = 0;

        // Keep whitespace as-is; wrap words in spans
        const parts = text.split(/(\s+)/);
        parts.forEach(part => {
            if (part.match(/^\s+$/)) {
                container.appendChild(document.createTextNode(part));
                idx += part.length;
            } else {
                const span = document.createElement('span');
                span.className = 'word-span';
                span.textContent = part;
                span.dataset.start = idx;
                span.dataset.end = idx + part.length;
                container.appendChild(span);
                wordSpans.push(span);
                idx += part.length;
            }
        });

        if (!document.getElementById('view-highlight-style')) {
            const style = document.createElement('style');
            style.id = 'view-highlight-style';
            style.textContent = '.word-span.highlight{ background: #001a20ff; border-radius: 2px; }';
            document.head.appendChild(style);
        }

        docContentEl.innerHTML = '';
        docContentEl.appendChild(container);
    }

    // Speak the document text
    function speakDocument() {
        if (currentUtterance) {
            // If already speaking, cancel and restart
            window.speechSynthesis.cancel();
            currentUtterance = null;
        }
        const text = docContentEl.textContent || '';
        if (!text.trim()) {
            return; // nothing to speak
        }

        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.rate = 0.95;
        currentUtterance.pitch = 1;

        // Use boundary events to highlight the current word (browser support varies)
        if ('onboundary' in SpeechSynthesisUtterance.prototype) {
            currentUtterance.onboundary = (evt) => {
                try {
                    const charIndex = evt.charIndex;
                    for (let i = 0; i < wordSpans.length; i++) {
                        const span = wordSpans[i];
                        const start = parseInt(span.dataset.start, 10);
                        const end = parseInt(span.dataset.end, 10);
                        if (charIndex >= start && charIndex < end) {
                            if (currentHighlighted && currentHighlighted !== span) {
                                currentHighlighted.classList.remove('highlight');
                            }
                            span.classList.add('highlight');
                            currentHighlighted = span;
                            span.scrollIntoView({ block: 'nearest', inline: 'nearest' });
                            break;
                        }
                    }
                } catch (err) {
                    // ignore
                }
            };
        }

        currentUtterance.onend = () => {
            if (currentHighlighted) {
                currentHighlighted.classList.remove('highlight');
                currentHighlighted = null;
            }
            currentUtterance = null;
        };

        window.speechSynthesis.speak(currentUtterance);
    }

    function stopSpeaking() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            currentUtterance = null;
            if (currentHighlighted) {
                currentHighlighted.classList.remove('highlight');
                currentHighlighted = null;
            }
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadDocument();

        const speakBtn = document.getElementById('speak-btn');
        const stopBtn = document.getElementById('stop-btn');

        speakBtn.addEventListener('click', speakDocument);
        stopBtn.addEventListener('click', stopSpeaking);

        // Keyboard shortcuts: Alt+P to speak, Alt+X to stop
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'p') {
                e.preventDefault();
                speakDocument();
            }
            if (e.altKey && e.key === 'x') {
                e.preventDefault();
                stopSpeaking();
            }
        });
    });
})();
