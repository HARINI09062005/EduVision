// view.js - display uploaded document and provide speak/stop controls
(() => {
    const params = new URLSearchParams(window.location.search);
    const docKey = params.get('docKey');

    const docNameEl = document.getElementById('doc-name');
    const docContentEl = document.getElementById('editor-textarea');
    const previewEl = document.getElementById('editor-preview');
    const downloadLinkEl = document.getElementById('download-link');

    let currentUtterance = null;
    let wordSpans = [];
    let currentHighlighted = null;
    let scrollSyncHandler = null;

    function announceToScreenReader(msg) {
        // Announcements are intentionally silenced in the viewer to avoid
        // redundant or noisy screen reader output (e.g., "Speaking document",
        // "Finished speaking", "No text available").
        // Keep this function present so calls are no-ops.
    }

    function loadDocument() {
        if (!docKey) {
            if (docNameEl) docNameEl.value = 'No document specified';
            if (docContentEl) docContentEl.value = 'Missing document key.';
            return;
        }

        const raw = localStorage.getItem(docKey);
        if (!raw) {
            if (docNameEl) docNameEl.value = 'Document not found';
            if (docContentEl) docContentEl.value = 'The requested document could not be found in local storage. It may have been removed.';
            return;
        }

        try {
            const payload = JSON.parse(raw);
            const { name, content, fileUrl } = payload;
            if (docNameEl) docNameEl.value = name || '';

            if (content) {
                // show content in the textarea and render preview spans for highlighting
                if (docContentEl) docContentEl.value = content;
                if (typeof renderContentWithSpans === 'function') renderContentWithSpans(content);
                downloadLinkEl.innerHTML = '';
            } else if (fileUrl) {
                if (docContentEl) docContentEl.value = 'Preview not available for this file type.';
                downloadLinkEl.innerHTML = `<a href="${fileUrl}" download="${name}">Download ${name}</a>`;
            } else {
                if (docContentEl) docContentEl.value = 'No preview available.';
            }

            // Optionally remove item from localStorage after reading
            // localStorage.removeItem(docKey);
        } catch (err) {
            console.error('Failed to parse document payload', err);
            if (docNameEl) docNameEl.value = 'Error loading document';
            if (docContentEl) docContentEl.value = 'Unable to load the document content.';
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
            style.textContent = '.word-span.highlight{ background: #fff59d; border-radius: 2px; }';
            document.head.appendChild(style);
        }

        // populate the preview overlay (used for highlighting) and keep textarea value
        if (previewEl) {
            previewEl.innerHTML = '';
            previewEl.appendChild(container);
            // ensure preview uses same wrapping as textarea
            previewEl.style.display = 'none';
            // copy computed textarea styles to the preview so it lines up exactly
            try {
                if (docContentEl) {
                    const cs = window.getComputedStyle(docContentEl);
                    previewEl.style.fontFamily = cs.fontFamily;
                    previewEl.style.fontSize = cs.fontSize;
                    previewEl.style.lineHeight = cs.lineHeight;
                    previewEl.style.padding = cs.padding;
                    previewEl.style.borderRadius = cs.borderRadius;
                    previewEl.style.boxSizing = cs.boxSizing;
                    previewEl.style.background = cs.backgroundColor || '#fff';
                    previewEl.style.color = cs.color || '#000';
                }
            } catch (e) {
                // ignore copy failure
            }
        }
        if (docContentEl && docContentEl.tagName === 'TEXTAREA') {
            docContentEl.value = text;
        }
    }



    // Speak the document text
    function speakDocument() {
        if (currentUtterance) {
            // If already speaking, cancel and restart
            window.speechSynthesis.cancel();
            currentUtterance = null;
        }
        const text = (docContentEl && 'value' in docContentEl) ? docContentEl.value : (docContentEl.textContent || '');
        if (!text.trim()) {
            return; // nothing to speak
        }

        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.rate = 0.95;
        currentUtterance.pitch = 1;

        // Show preview overlay and sync scrolling, then use boundary events to highlight the current word (browser support varies)
        if (previewEl) {
            previewEl.style.display = 'block';
            previewEl.style.zIndex = '9999';
            // sync scroll while speaking
            const syncScroll = () => {
                try {
                    previewEl.scrollTop = docContentEl.scrollTop;
                    previewEl.scrollLeft = docContentEl.scrollLeft;
                } catch (e) { /* ignore */ }
            };
            scrollSyncHandler = syncScroll;
            docContentEl.addEventListener('scroll', scrollSyncHandler);
            // do an initial sync
            syncScroll();
            // hide textarea text and focus ring while overlay is visible
            try {
                docContentEl._savedStyles = {
                    color: docContentEl.style.color || '',
                    outline: docContentEl.style.outline || '',
                    boxShadow: docContentEl.style.boxShadow || ''
                };
                docContentEl.style.color = 'transparent';
                docContentEl.style.outline = 'none';
                docContentEl.style.boxShadow = 'none';
            } catch (e) { /* ignore */ }
        }

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
                            // scroll preview into view to keep highlight visible
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
            // hide preview overlay
            if (previewEl) previewEl.style.display = 'none';
            // restore textarea styles
            try {
                if (docContentEl && docContentEl._savedStyles) {
                    docContentEl.style.color = docContentEl._savedStyles.color || '';
                    docContentEl.style.outline = docContentEl._savedStyles.outline || '';
                    docContentEl.style.boxShadow = docContentEl._savedStyles.boxShadow || '';
                    docContentEl._savedStyles = null;
                }
            } catch (e) { /* ignore */ }
            // remove scroll sync handler
            if (scrollSyncHandler && docContentEl) {
                docContentEl.removeEventListener('scroll', scrollSyncHandler);
                scrollSyncHandler = null;
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
            if (previewEl) previewEl.style.display = 'none';
            if (scrollSyncHandler && docContentEl) {
                docContentEl.removeEventListener('scroll', scrollSyncHandler);
                scrollSyncHandler = null;
            }
            try {
                if (docContentEl && docContentEl._savedStyles) {
                    docContentEl.style.color = docContentEl._savedStyles.color || '';
                    docContentEl.style.outline = docContentEl._savedStyles.outline || '';
                    docContentEl.style.boxShadow = docContentEl._savedStyles.boxShadow || '';
                    docContentEl._savedStyles = null;
                }
            } catch (e) { /* ignore */ }
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
