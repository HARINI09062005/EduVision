// editor.js - standalone editor page for creating a new document
(function () {
  const nameInput = document.getElementById('doc-name');
  const textarea = document.getElementById('editor-textarea');
  const speakBtn = document.getElementById('speak-btn');
  const stopBtn = document.getElementById('stop-btn');
  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const saveStatus = document.getElementById('save-status');

  let utter = null;
  let preview = document.getElementById('editor-preview');
  let previewSpans = [];
  let currentHighlight = null;

  function speak() {
    const text = textarea.value || '';
    if (!text.trim()) return;

    if (utter) {
      window.speechSynthesis.cancel();
      utter = null;
    }

    // Render preview spans for highlighting
    renderPreviewSpans(text);

    // show preview overlay and hide textarea interaction
    if (preview) {
      // match preview background/color to textarea to avoid sudden black box
      try {
        const comp = window.getComputedStyle(textarea);
        preview.style.background = comp.backgroundColor || '#ffffff';
        preview.style.color = comp.color || '#000000';
      } catch (e) {
        preview.style.background = '#ffffff';
        preview.style.color = '#000000';
      }
      preview.style.display = 'block';
      textarea.style.visibility = 'hidden';
      preview.setAttribute('aria-hidden', 'false');
    }

    utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1;

    // Boundary event for highlighting
    if ('onboundary' in SpeechSynthesisUtterance.prototype) {
      utter.onboundary = (evt) => {
        try {
          const charIndex = evt.charIndex;
          for (let i = 0; i < previewSpans.length; i++) {
            const span = previewSpans[i];
            const start = parseInt(span.dataset.start, 10);
            const end = parseInt(span.dataset.end, 10);
            if (charIndex >= start && charIndex < end) {
              if (currentHighlight && currentHighlight !== span) currentHighlight.classList.remove('highlight');
              span.classList.add('highlight');
              currentHighlight = span;
              // ensure visible
              span.scrollIntoView({ block: 'nearest', inline: 'nearest' });
              break;
            }
          }
        } catch (e) { /* ignore */ }
      };
    }

    utter.onend = () => {
      clearPreviewHighlight();
      utter = null;
      restoreTextarea();
    };

    window.speechSynthesis.speak(utter);
  }

  function stop() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      utter = null;
      clearPreviewHighlight();
      restoreTextarea();
    }
  }

  function renderPreviewSpans(text) {
    previewSpans = [];
    currentHighlight = null;
    if (!preview) return;
    preview.innerHTML = '';

    let idx = 0;
    const parts = text.split(/(\s+)/);
    parts.forEach(part => {
      if (/^\s+$/.test(part)) {
        preview.appendChild(document.createTextNode(part));
        idx += part.length;
      } else {
        const span = document.createElement('span');
        span.className = 'word-span';
        span.textContent = part;
        span.dataset.start = idx;
        span.dataset.end = idx + part.length;
        preview.appendChild(span);
        previewSpans.push(span);
        idx += part.length;
      }
    });
  }

  function clearPreviewHighlight() {
    if (!preview) return;
    previewSpans.forEach(s => s.classList.remove('highlight'));
    currentHighlight = null;
  }

  function restoreTextarea() {
    if (preview) {
      preview.style.display = 'none';
      preview.setAttribute('aria-hidden', 'true');
      textarea.style.visibility = 'visible';
    }
  }

  function save() {
    const text = textarea.value || '';
    if (!text.trim()) {
      // show brief status
      saveStatus.textContent = 'Nothing to save.';
      saveStatus.classList.remove('visually-hidden');
      setTimeout(() => saveStatus.classList.add('visually-hidden'), 1500);
      return;
    }

    let name = (nameInput && nameInput.value && nameInput.value.trim()) || `Document_${Date.now()}.txt`;
    // ensure simple filename
    name = name.replace(/[\\\/\?%*:|"<>]/g, '').trim() || `Document_${Date.now()}.txt`;

    // Create a downloadable file (no redirect)
    try {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      saveStatus.textContent = 'Download started';
      saveStatus.classList.remove('visually-hidden');
      setTimeout(() => saveStatus.classList.add('visually-hidden'), 1500);
    } catch (err) {
      console.error('Failed to prepare download', err);
      saveStatus.textContent = 'Failed to start download';
      saveStatus.classList.remove('visually-hidden');
    }
  }

  function cancel() {
    // stop and close
    stop();
    try { window.close(); } catch (e) { window.location.href = 'create.html'; }
  }

  speakBtn && speakBtn.addEventListener('click', speak);
  stopBtn && stopBtn.addEventListener('click', stop);
  saveBtn && saveBtn.addEventListener('click', save);
  cancelBtn && cancelBtn.addEventListener('click', cancel);

  // keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'p') { e.preventDefault(); speak(); }
    if (e.altKey && e.key === 'x') { e.preventDefault(); stop(); }
    if (e.key === 'Escape') { cancel(); }
  });

  // focus textarea on load
  window.addEventListener('DOMContentLoaded', () => {
    textarea && textarea.focus();
  });
})();