/**
 * Hugo CMS Editor - Auto-save Functionality
 */

// ========================================
// LocalStorage Auto-save
// ========================================
function scheduleAutosave() {
    if (autosaveTimer) {
        clearTimeout(autosaveTimer);
    }
    autosaveTimer = setTimeout(saveToLocalStorage, AUTOSAVE_INTERVAL);
    updateAutosaveStatus('saving');
}

function saveToLocalStorage() {
    if (editMode) {
        // Don't autosave when editing existing post
        return;
    }

    const draftData = {
        title: elements.title.value,
        date: elements.date.value,
        description: elements.description.value,
        author: elements.author.value,
        authorImage: elements.authorImageInput.value,
        tags: selectedTags,
        math: elements.math.checked,
        draft: elements.draft.checked,
        content: quill.root.innerHTML,
        savedAt: new Date().toISOString()
    };

    try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draftData));
        updateAutosaveStatus('saved');
    } catch (e) {
        console.error('Failed to save draft:', e);
        updateAutosaveStatus('error');
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem(AUTOSAVE_KEY);
        if (!saved) return false;

        const draftData = JSON.parse(saved);

        // Check if draft has meaningful content
        const hasContent = draftData.title || draftData.description ||
            (draftData.content && draftData.content !== '<p><br></p>');

        if (!hasContent) return false;

        // Restore form data
        elements.title.value = draftData.title || '';
        elements.date.value = draftData.date || '';
        elements.description.value = draftData.description || '';
        elements.author.value = draftData.author || 'Yu Xuan Low';
        elements.authorImageInput.value = draftData.authorImage || 'profile.png';
        elements.math.checked = draftData.math || false;
        elements.draft.checked = draftData.draft || false;

        // Restore tags
        if (draftData.tags && Array.isArray(draftData.tags)) {
            setTags(draftData.tags);
        }

        // Restore content
        if (draftData.content) {
            quill.root.innerHTML = draftData.content;
        }

        // Load author image preview
        loadDefaultAuthorImage();

        updateAutosaveStatus('restored');
        return true;
    } catch (e) {
        console.error('Failed to load draft:', e);
        return false;
    }
}

function clearLocalStorage() {
    localStorage.removeItem(AUTOSAVE_KEY);
    updateAutosaveStatus('cleared');
}

function updateAutosaveStatus(status) {
    if (!elements.autosaveStatus) return;

    const statusText = elements.autosaveStatus.querySelector('span');
    const statusIcon = elements.autosaveStatus.querySelector('i');

    if (!statusText || !statusIcon) return;

    switch (status) {
        case 'saving':
            statusText.textContent = 'Saving...';
            statusIcon.setAttribute('data-lucide', 'loader');
            break;
        case 'saved':
            statusText.textContent = 'Draft saved';
            statusIcon.setAttribute('data-lucide', 'cloud');
            break;
        case 'restored':
            statusText.textContent = 'Draft restored';
            statusIcon.setAttribute('data-lucide', 'cloud-download');
            break;
        case 'error':
            statusText.textContent = 'Save failed';
            statusIcon.setAttribute('data-lucide', 'cloud-off');
            break;
        case 'cleared':
            statusText.textContent = 'Ready';
            statusIcon.setAttribute('data-lucide', 'cloud');
            break;
        default:
            statusText.textContent = 'Ready';
            statusIcon.setAttribute('data-lucide', 'cloud');
    }
    refreshIcons();
}

// Add input listeners for autosave
function initAutosave() {
    const inputs = [elements.title, elements.description, elements.author, elements.date];
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', scheduleAutosave);
        }
    });

    // Restore draft on load
    const restored = loadFromLocalStorage();
    if (restored) {
        showToast('Previous draft restored', 'success');
    }
}
