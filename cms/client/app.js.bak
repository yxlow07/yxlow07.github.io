/**
 * Hugo CMS Editor - Client Application
 * Features: Create, Edit, Delete posts, Image upload, Light/Dark mode
 * Tag pills, Author image preview, Markdown shortcuts, Auto-save
 * Using Lucide icons
 */

// ========================================
// Configuration
// ========================================
const API_BASE = '/api';
const AUTOSAVE_KEY = 'hugo-cms-draft';
const AUTOSAVE_INTERVAL = 5000; // 5 seconds

// Tags will be dynamically loaded from posts
let AVAILABLE_TAGS = [];

// ========================================
// State
// ========================================
let editMode = false;
let editSlug = null;
let deleteSlug = null;
let uploadedImageFile = null;
let selectedTags = [];
let autosaveTimer = null;
let metadataCollapsed = false;

// ========================================
// DOM Elements
// ========================================
const elements = {
    postForm: document.getElementById('post-form'),
    editorView: document.getElementById('editor-view'),
    postsView: document.getElementById('posts-view'),
    postsList: document.getElementById('posts-list'),
    previewModal: document.getElementById('preview-modal'),
    previewContent: document.getElementById('preview-content'),
    previewBtn: document.getElementById('preview-btn'),
    closePreview: document.getElementById('close-preview'),
    refreshPosts: document.getElementById('refresh-posts'),
    toast: document.getElementById('toast'),
    navBtns: document.querySelectorAll('.nav-btn'),
    themeToggle: document.getElementById('theme-toggle'),
    editorTitle: document.getElementById('editor-title'),
    saveBtn: document.getElementById('save-btn'),
    cancelEdit: document.getElementById('cancel-edit'),
    editSlugInput: document.getElementById('edit-slug'),

    // Metadata toggle
    metadataToggle: document.getElementById('metadata-toggle'),
    metadataContent: document.getElementById('metadata-content'),
    metadataChevron: document.getElementById('metadata-chevron'),

    // Autosave status
    autosaveStatus: document.getElementById('autosave-status'),

    // Image upload
    imageUploadArea: document.getElementById('image-upload-area'),
    imageFile: document.getElementById('image-file'),
    imagePreview: document.getElementById('image-preview'),
    previewImg: document.getElementById('preview-img'),
    removeImage: document.getElementById('remove-image'),
    imageInput: document.getElementById('image'),

    // Author image upload
    authorUploadArea: document.getElementById('author-upload-area'),
    authorImageFile: document.getElementById('author-image-file'),
    authorImagePreview: document.getElementById('author-image-preview'),
    authorPreviewImg: document.getElementById('author-preview-img'),
    removeAuthorImage: document.getElementById('remove-author-image'),
    authorImageInput: document.getElementById('authorImage'),

    // Tags
    tagsInput: document.getElementById('tags-input'),
    tagsPills: document.getElementById('tags-pills'),
    tagsDropdown: document.getElementById('tags-dropdown'),
    tagsHidden: document.getElementById('tags'),

    // Delete modal
    deleteModal: document.getElementById('delete-modal'),
    deleteMessage: document.getElementById('delete-message'),
    cancelDelete: document.getElementById('cancel-delete'),
    confirmDelete: document.getElementById('confirm-delete'),

    // Form inputs
    title: document.getElementById('title'),
    date: document.getElementById('date'),
    description: document.getElementById('description'),
    author: document.getElementById('author'),
    math: document.getElementById('math'),
    draft: document.getElementById('draft')
};

// ========================================
// Quill Editor with Markdown Shortcuts
// ========================================
const quill = new Quill('#editor', {
    theme: 'snow',
    placeholder: 'Write your blog post content here...',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ]
    }
});

// Markdown shortcuts handler
quill.on('text-change', function (delta, oldDelta, source) {
    if (source !== 'user') return;

    // Trigger autosave on content change
    scheduleAutosave();

    const selection = quill.getSelection();
    if (!selection) return;

    const [line] = quill.getLine(selection.index);
    if (!line) return;

    const lineText = line.domNode.textContent;
    const lineStart = quill.getIndex(line);
    const cursorInLine = selection.index - lineStart;

    // Identify what was inserted
    const insertOp = delta.ops.find(op => op.insert);
    if (!insertOp || typeof insertOp.insert !== 'string') return;
    const char = insertOp.insert;

    // 1. Check for inline backticks `code`
    if (char === '`') {
        const textBefore = lineText.substring(0, cursorInLine - 1);
        const lastBacktickIndex = textBefore.lastIndexOf('`');

        if (lastBacktickIndex !== -1) {
            const codeText = textBefore.substring(lastBacktickIndex + 1);
            if (codeText.length > 0) {
                setTimeout(() => {
                    quill.deleteText(lineStart + lastBacktickIndex, codeText.length + 2);
                    quill.insertText(lineStart + lastBacktickIndex, codeText, 'code', true);
                    quill.setSelection(lineStart + lastBacktickIndex + codeText.length, 0);
                    quill.format('code', false);
                }, 0);
                return;
            }
        }
    }

    // 2. Check for inline bold **text** and italic *text*
    if (char === '*') {
        const textBefore = lineText.substring(0, cursorInLine);

        // Check for **bold** first (closing **)
        // Pattern: **something**
        if (textBefore.length >= 4 && textBefore.endsWith('**')) {
            // Find opening **
            const searchText = textBefore.slice(0, -2); // Remove closing **
            const openingIndex = searchText.lastIndexOf('**');
            if (openingIndex !== -1) {
                const boldText = searchText.substring(openingIndex + 2);
                if (boldText.length > 0 && !boldText.includes('*')) {
                    setTimeout(() => {
                        const startPos = lineStart + openingIndex;
                        quill.deleteText(startPos, boldText.length + 4);
                        quill.insertText(startPos, boldText, 'bold', true);
                        quill.setSelection(startPos + boldText.length, 0);
                        quill.format('bold', false);
                    }, 0);
                    return;
                }
            }
        }

        // Check for *italic* (single asterisks, not double)
        // Only if we don't have ** at the end
        if (!textBefore.endsWith('**') && textBefore.length >= 2) {
            // Find opening * that is not part of **
            const searchText = textBefore.slice(0, -1); // Remove closing *
            let openingIndex = -1;

            // Search backwards for a single * not preceded by another *
            for (let i = searchText.length - 1; i >= 0; i--) {
                if (searchText[i] === '*') {
                    // Check if this is a single * (not part of **)
                    const prevChar = i > 0 ? searchText[i - 1] : '';
                    const nextChar = i < searchText.length - 1 ? searchText[i + 1] : '';
                    if (prevChar !== '*' && nextChar !== '*') {
                        openingIndex = i;
                        break;
                    }
                }
            }

            if (openingIndex !== -1) {
                const italicText = searchText.substring(openingIndex + 1);
                if (italicText.length > 0 && !italicText.includes('*')) {
                    setTimeout(() => {
                        const startPos = lineStart + openingIndex;
                        quill.deleteText(startPos, italicText.length + 2);
                        quill.insertText(startPos, italicText, 'italic', true);
                        quill.setSelection(startPos + italicText.length, 0);
                        quill.format('italic', false);
                    }, 0);
                    return;
                }
            }
        }
    }

    // 3. Check for _italic_ and __bold__ with underscores
    if (char === '_') {
        const textBefore = lineText.substring(0, cursorInLine);

        // Check for __bold__ first (closing __)
        if (textBefore.length >= 4 && textBefore.endsWith('__')) {
            const searchText = textBefore.slice(0, -2);
            const openingIndex = searchText.lastIndexOf('__');
            if (openingIndex !== -1) {
                const boldText = searchText.substring(openingIndex + 2);
                if (boldText.length > 0 && !boldText.includes('_')) {
                    setTimeout(() => {
                        const startPos = lineStart + openingIndex;
                        quill.deleteText(startPos, boldText.length + 4);
                        quill.insertText(startPos, boldText, 'bold', true);
                        quill.setSelection(startPos + boldText.length, 0);
                        quill.format('bold', false);
                    }, 0);
                    return;
                }
            }
        }

        // Check for _italic_ (single underscores)
        if (!textBefore.endsWith('__') && textBefore.length >= 2) {
            const searchText = textBefore.slice(0, -1);
            let openingIndex = -1;

            for (let i = searchText.length - 1; i >= 0; i--) {
                if (searchText[i] === '_') {
                    const prevChar = i > 0 ? searchText[i - 1] : '';
                    const nextChar = i < searchText.length - 1 ? searchText[i + 1] : '';
                    if (prevChar !== '_' && nextChar !== '_') {
                        openingIndex = i;
                        break;
                    }
                }
            }

            if (openingIndex !== -1) {
                const italicText = searchText.substring(openingIndex + 1);
                if (italicText.length > 0 && !italicText.includes('_')) {
                    setTimeout(() => {
                        const startPos = lineStart + openingIndex;
                        quill.deleteText(startPos, italicText.length + 2);
                        quill.insertText(startPos, italicText, 'italic', true);
                        quill.setSelection(startPos + italicText.length, 0);
                        quill.format('italic', false);
                    }, 0);
                    return;
                }
            }
        }
    }

    // 4. Check for block-level shortcuts (on space or #)
    if (char === ' ' || char === '#' || char === '*' || char === '-') {
        // For space, check with the space included
        const textBefore = char === ' ' ? lineText.substring(0, cursorInLine) : lineText.substring(0, cursorInLine - 1) + char;

        const patterns = [
            { regex: /^# $/, format: { header: 1 }, len: 2, trigger: ' ' },
            { regex: /^## $/, format: { header: 2 }, len: 3, trigger: ' ' },
            { regex: /^### $/, format: { header: 3 }, len: 4, trigger: ' ' },
            { regex: /^> $/, format: { blockquote: true }, len: 2, trigger: ' ' },
            { regex: /^- $/, format: { list: 'bullet' }, len: 2, trigger: ' ' },
            { regex: /^\* $/, format: { list: 'bullet' }, len: 2, trigger: ' ' },
            { regex: /^1\. $/, format: { list: 'ordered' }, len: 3, trigger: ' ' },
            { regex: /^#/, format: { header: 1 }, len: 1, trigger: '#' },
            { regex: /^##/, format: { header: 2 }, len: 2, trigger: '#' },
            { regex: /^###/, format: { header: 3 }, len: 3, trigger: '#' }
        ];

        for (const pattern of patterns) {
            if (char === pattern.trigger && pattern.regex.test(textBefore)) {
                setTimeout(() => {
                    if (char === ' ') {
                        quill.deleteText(lineStart, pattern.len);
                        quill.formatLine(lineStart, 1, pattern.format);
                        quill.setSelection(lineStart, 0);
                    } else {
                        // For immediate formatting (# or * or -), format after typing
                        quill.formatLine(lineStart, 1, pattern.format);
                    }
                }, 0);
                return;
            }
        }
    }

    // 3. Special case for code block ```
    if (lineText.substring(0, cursorInLine) === '```') {
        setTimeout(() => {
            quill.deleteText(lineStart, 3);
            quill.formatLine(lineStart, 1, 'code-block', true);
        }, 0);
    }
});

// ========================================
// Theme Management
// ========================================
function initTheme() {
    const savedTheme = localStorage.getItem('hugo-cms-theme') || 'light';
    setTheme(savedTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hugo-cms-theme', theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
}

// ========================================
// Metadata Collapse Toggle
// ========================================
function initMetadataToggle() {
    const savedState = localStorage.getItem('hugo-cms-metadata-collapsed');
    metadataCollapsed = savedState === 'true';
    updateMetadataVisibility();

    elements.metadataToggle.addEventListener('click', () => {
        metadataCollapsed = !metadataCollapsed;
        localStorage.setItem('hugo-cms-metadata-collapsed', metadataCollapsed);
        updateMetadataVisibility();
    });
}

function updateMetadataVisibility() {
    if (metadataCollapsed) {
        elements.metadataContent.style.display = 'none';
        elements.metadataChevron.style.transform = 'rotate(-90deg)';
    } else {
        elements.metadataContent.style.display = 'block';
        elements.metadataChevron.style.transform = 'rotate(0deg)';
    }
}

// ========================================
// Utility Functions
// ========================================
function showToast(message, type = 'success') {
    elements.toast.textContent = message;
    elements.toast.className = `fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-md text-base text-white font-medium z-[2000] shadow-lg transition-all duration-200 ${type} show`;
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 2500);
}

function formatDateForHugo(dateString) {
    const date = new Date(dateString);
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
    const minutes = String(Math.abs(offset) % 60).padStart(2, '0');
    return date.toISOString().slice(0, 19) + sign + hours + ':' + minutes;
}

function formatDateForInput(isoString) {
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setDefaultDate() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60 * 1000);
    elements.date.value = localDate.toISOString().slice(0, 16);
}

// Helper to reinitialize Lucide icons for dynamically added content
function refreshIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

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

// ========================================
// Dynamic Tags from Posts
// ========================================
async function loadTagsFromPosts() {
    try {
        console.log('Fetching posts for tags...');
        const result = await fetchPosts();
        console.log('Posts result:', result);
        if (result.success && result.posts) {
            const allTags = new Set();
            result.posts.forEach(post => {
                if (post.tags && Array.isArray(post.tags)) {
                    post.tags.forEach(tag => allTags.add(tag.toLowerCase()));
                }
            });
            AVAILABLE_TAGS = Array.from(allTags).sort();
            console.log('Loaded tags:', AVAILABLE_TAGS);
        } else {
            console.warn('No posts found or failed to load posts for tags.');
        }
    } catch (e) {
        console.error('Failed to load tags from posts:', e);
        // Fallback to default tags
        AVAILABLE_TAGS = [
            'algorithms', 'coding', 'tutorial', 'web development',
            'machine learning', 'python', 'javascript', 'projects', 'life'
        ];
    }
}

// ========================================
// HTML to Markdown Conversion
// ========================================
function htmlToMarkdown(html) {
    let md = html;

    // Headers
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');

    // Bold & Italic
    md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
    md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

    // Strikethrough
    md = md.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~');
    md = md.replace(/<strike[^>]*>(.*?)<\/strike>/gi, '~~$1~~');

    // Links
    md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

    // Images
    md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
    md = md.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)');

    // Code blocks
    md = md.replace(/<pre[^>]*class="ql-syntax"[^>]*>([\s\S]*?)<\/pre>/gi, '```\n$1\n```\n\n');
    md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

    // Blockquotes
    md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
        const lines = content.replace(/<[^>]+>/g, '').split('\n');
        return lines.map(line => `> ${line.trim()}`).join('\n') + '\n\n';
    });

    // Lists
    md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n';
    });
    md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
        let counter = 1;
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. \n`) + '\n';
    });

    // Paragraphs
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

    // Line breaks
    md = md.replace(/<br\s*\/?>/gi, '\n');

    // Remove remaining HTML tags
    md = md.replace(/<[^>]+>/g, '');

    // Decode entities
    md = md.replace(/&nbsp;/g, ' ');
    md = md.replace(/&amp;/g, '&');
    md = md.replace(/&lt;/g, '<');
    md = md.replace(/&gt;/g, '>');
    md = md.replace(/&quot;/g, '"');

    // Clean up whitespace
    md = md.replace(/\n{3,}/g, '\n\n');

    return md.trim();
}

// ========================================
// Markdown to HTML Conversion (for loading)
// ========================================
function markdownToHtml(md) {
    let html = md;

    // Escape HTML first
    html = html.replace(/&/g, '&amp;');
    html = html.replace(/</g, '&lt;');
    html = html.replace(/>/g, '&gt;');

    // Code blocks (do first to protect content)
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="ql-syntax">$1</pre>');

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold and Italic - order matters: bold first, then italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Use a simpler regex for italic that doesn't use lookbehind (better compatibility)
    html = html.replace(/(?:^|[^*])\*([^*]+)\*(?:[^*]|$)/g, (match, p1) => {
        return match.replace(`*${p1}*`, `<em>${p1}</em>`);
    });
    html = html.replace(/~~([^~]+)~~/g, '<s>$1</s>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

    // Blockquotes
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // Lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Paragraphs - split by double newlines
    const blocks = html.split(/\n\n+/);
    html = blocks.map(block => {
        block = block.trim();
        if (!block) return '';
        // Don't wrap if already has block-level tags
        if (/^<(h[1-6]|pre|blockquote|ul|ol|li)/.test(block)) {
            return block;
        }
        // Convert single newlines to <br> within paragraphs
        block = block.replace(/\n/g, '<br>');
        return `<p>${block}</p>`;
    }).join('');

    return html;
}

// ========================================
// Author Image Upload
// ========================================
let uploadedAuthorImageFile = null;

function initAuthorImageUpload() {
    // Show default profile image if exists
    loadDefaultAuthorImage();

    elements.authorUploadArea.addEventListener('click', () => elements.authorImageFile.click());

    elements.authorImageFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleAuthorImageSelect(e.target.files[0]);
        }
    });

    elements.removeAuthorImage.addEventListener('click', clearAuthorImageUpload);
}

function loadDefaultAuthorImage() {
    const defaultImage = elements.authorImageInput.value.trim();
    if (defaultImage) {
        elements.authorPreviewImg.src = `/images/${defaultImage}`;
        elements.authorImagePreview.classList.add('active');
        elements.authorUploadArea.style.display = 'none';

        // Handle load error - show upload area instead
        elements.authorPreviewImg.onerror = () => {
            elements.authorImagePreview.classList.remove('active');
            elements.authorUploadArea.style.display = 'flex';
        };
    }
}

function handleAuthorImageSelect(file) {
    uploadedAuthorImageFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        elements.authorPreviewImg.src = e.target.result;
        elements.authorImagePreview.classList.add('active');
        elements.authorUploadArea.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function clearAuthorImageUpload() {
    uploadedAuthorImageFile = null;
    elements.authorImageFile.value = '';
    elements.authorImageInput.value = '';
    elements.authorPreviewImg.src = '';
    elements.authorImagePreview.classList.remove('active');
    elements.authorUploadArea.style.display = 'flex';
}

// ========================================
// Tags Management
// ========================================
function initTags() {
    renderTagPills();

    elements.tagsInput.addEventListener('focus', showTagsDropdown);
    elements.tagsInput.addEventListener('input', filterTagsDropdown);
    elements.tagsInput.addEventListener('keydown', handleTagKeydown);

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!elements.tagsInput.contains(e.target) && !elements.tagsDropdown.contains(e.target)) {
            elements.tagsDropdown.classList.remove('active');
        }
    });
}

function showTagsDropdown() {
    filterTagsDropdown();
    elements.tagsDropdown.classList.add('active');
}

function filterTagsDropdown() {
    const query = elements.tagsInput.value.toLowerCase().trim();

    // Filter available tags that haven't been selected yet and match the query
    console.log('Filtering tags. Query:', query, 'Available:', AVAILABLE_TAGS);
    const availableTags = AVAILABLE_TAGS.filter(tag => {
        const lowerTag = tag.toLowerCase();
        const isSelected = selectedTags.some(st => st.toLowerCase() === lowerTag);
        return !isSelected && lowerTag.includes(query);
    });

    let html = '';

    // Show matching predefined tags
    availableTags.forEach(tag => {
        html += `<div class="tag-option" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</div>`;
    });

    // Show option to create new tag if query doesn't match exactly and is not empty
    if (query && !availableTags.includes(query) && !selectedTags.some(st => st.toLowerCase() === query)) {
        html += `<div class="tag-option tag-create" data-tag="${escapeHtml(query)}">
            <span class="create-icon">+</span> Create "${escapeHtml(query)}"
        </div>`;
    }

    if (!html) {
        html = '<div class="tag-option disabled">No tags available</div>';
    }

    elements.tagsDropdown.innerHTML = html;

    // Ensure dropdown is visible when filtering
    elements.tagsDropdown.classList.add('active');

    // Add click handlers
    elements.tagsDropdown.querySelectorAll('.tag-option:not(.disabled)').forEach(option => {
        option.addEventListener('click', () => {
            addTag(option.dataset.tag);
            elements.tagsInput.value = '';
            elements.tagsDropdown.classList.remove('active');
            renderTagPills();
        });
    });
}


function handleTagKeydown(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const query = elements.tagsInput.value.trim();
        if (query && !selectedTags.includes(query)) {
            addTag(query);
            elements.tagsInput.value = '';
            elements.tagsDropdown.classList.remove('active');
        }
    } else if (e.key === 'Backspace' && !elements.tagsInput.value && selectedTags.length > 0) {
        removeTag(selectedTags[selectedTags.length - 1]);
    }
}

function addTag(tag) {
    const lowerTag = tag.toLowerCase();
    const alreadyExists = selectedTags.some(t => t.toLowerCase() === lowerTag);
    if (!alreadyExists) {
        selectedTags.push(tag);
        renderTagPills();
        updateTagsHidden();
        scheduleAutosave();
    }
}

function removeTag(tag) {
    selectedTags = selectedTags.filter(t => t !== tag);
    renderTagPills();
    updateTagsHidden();
    scheduleAutosave();
}

function renderTagPills() {
    elements.tagsPills.innerHTML = selectedTags.map(tag => `
        <span class="tag-pill">
            ${escapeHtml(tag)}
            <button type="button" class="tag-remove" data-tag="${escapeHtml(tag)}">×</button>
        </span>
    `).join('');

    // Add remove handlers
    elements.tagsPills.querySelectorAll('.tag-remove').forEach(btn => {
        btn.addEventListener('click', () => removeTag(btn.dataset.tag));
    });
}

function updateTagsHidden() {
    elements.tagsHidden.value = selectedTags.join(', ');
}

function setTags(tags) {
    selectedTags = Array.isArray(tags) ? [...tags] : [];
    renderTagPills();
    updateTagsHidden();
}

// ========================================
// Image Upload
// ========================================
function initImageUpload() {
    const area = elements.imageUploadArea;

    area.addEventListener('click', () => elements.imageFile.click());

    area.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.classList.add('dragover');
    });

    area.addEventListener('dragleave', () => {
        area.classList.remove('dragover');
    });

    area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            handleImageSelect(files[0]);
        }
    });

    elements.imageFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageSelect(e.target.files[0]);
        }
    });

    elements.removeImage.addEventListener('click', clearImageUpload);
}

function handleImageSelect(file) {
    uploadedImageFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        elements.previewImg.src = e.target.result;
        elements.imagePreview.classList.add('active');
        elements.imageUploadArea.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function clearImageUpload() {
    uploadedImageFile = null;
    elements.imageFile.value = '';
    elements.imageInput.value = '';
    elements.previewImg.src = '';
    elements.imagePreview.classList.remove('active');
    elements.imageUploadArea.style.display = 'flex';
}

// ========================================
// Form Data Management
// ========================================
function getFormData() {
    return {
        title: elements.title.value,
        date: formatDateForHugo(elements.date.value),
        description: elements.description.value,
        image: elements.imageInput.value,
        author: elements.author.value,
        authorImage: elements.authorImageInput.value,
        tags: selectedTags.join(', '),
        math: elements.math.checked,
        draft: elements.draft.checked
    };
}

function generatePreview() {
    const formData = getFormData();
    const content = htmlToMarkdown(quill.root.innerHTML);

    let preview = '---\n';
    preview += `lastMod: "${new Date().toISOString()}"\n`;
    preview += `title: "${formData.title}"\n`;
    preview += `date: ${formData.date}\n`;
    preview += `draft: ${formData.draft}\n`;
    preview += `description: "${formData.description}"\n`;
    if (formData.image) preview += `image: "${formData.image}"\n`;
    preview += `author: "${formData.author}"\n`;
    preview += `authorImage: "${formData.authorImage}"\n`;
    preview += `math: ${formData.math}\n`;

    if (selectedTags.length > 0) {
        preview += 'tags:\n  [\n';
        selectedTags.forEach((tag, i) => {
            const comma = i < selectedTags.length - 1 ? ',' : '';
            preview += `    "${tag}"${comma}\n`;
        });
        preview += '  ]\n';
    }

    preview += '---\n\n' + content;
    return preview;
}

function resetForm() {
    editMode = false;
    editSlug = null;
    elements.editSlugInput.value = '';
    elements.postForm.reset();
    quill.setContents([]);
    clearImageUpload();
    setDefaultDate();
    setTags([]);
    elements.editorTitle.textContent = 'Create New Post';
    elements.saveBtn.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i> Save Post';
    elements.cancelEdit.style.display = 'none';
    elements.author.value = 'Yu Xuan Low';

    // Reset author image to default
    elements.authorImageInput.value = 'profile.png';
    loadDefaultAuthorImage();

    // Clear autosave
    clearLocalStorage();

    refreshIcons();
}

// ========================================
// API Functions
// ========================================
async function createPost(data, imageFile) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });
    if (imageFile) {
        formData.append('featuredImage', imageFile);
    }

    const response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        body: formData
    });
    return response.json();
}

async function updatePost(slug, data, imageFile) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });
    if (imageFile) {
        formData.append('featuredImage', imageFile);
    }

    const response = await fetch(`${API_BASE}/posts/${slug}`, {
        method: 'PUT',
        body: formData
    });
    return response.json();
}

async function deletePost(slug) {
    const response = await fetch(`${API_BASE}/posts/${slug}`, {
        method: 'DELETE'
    });
    return response.json();
}

async function fetchPosts() {
    const response = await fetch(`${API_BASE}/posts`);
    return response.json();
}

async function fetchPost(slug) {
    const response = await fetch(`${API_BASE}/posts/${slug}`);
    return response.json();
}

// ========================================
// Event Handlers
// ========================================
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = getFormData();
    const content = htmlToMarkdown(quill.root.innerHTML);

    if (!formData.title.trim()) {
        showToast('Please enter a title', 'error');
        return;
    }

    if (!content.trim()) {
        showToast('Please add some content', 'error');
        return;
    }

    try {
        let result;
        if (editMode && editSlug) {
            result = await updatePost(editSlug, { ...formData, content }, uploadedImageFile);
        } else {
            result = await createPost({ ...formData, content }, uploadedImageFile);
        }

        if (result.success) {
            showToast(result.message || 'Post saved successfully!', 'success');
            resetForm();
            // Reload tags after saving a new post
            loadTagsFromPosts();
        } else {
            showToast(result.error || 'Failed to save post', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

function handleNavigation(e) {
    const btn = e.target.closest('.nav-btn');
    if (!btn) return;

    const view = btn.dataset.view;

    elements.navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`${view}-view`).classList.add('active');

    if (view === 'posts') loadPosts();
}

async function loadPosts() {
    elements.postsList.innerHTML = '<p class="loading">Loading posts...</p>';

    try {
        const result = await fetchPosts();

        if (result.success && result.posts.length > 0) {
            elements.postsList.innerHTML = result.posts.map(post => `
                <div class="post-item" data-slug="${post.slug}">
                    <div class="post-info">
                        <h4>${escapeHtml(post.title)}</h4>
                        <p class="date">${post.date}</p>
                        <span class="filename">${post.filename}</span>
                    </div>
                    <div class="post-actions">
                        <button class="btn btn-secondary btn-sm" onclick="editPost('${post.slug}')">
                            <i data-lucide="pencil" class="w-4 h-4"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="showDeleteConfirm('${post.slug}', '${escapeHtml(post.title).replace(/'/g, "\\'")}')">
                            <i data-lucide="trash-2" class="w-4 h-4"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
            refreshIcons();
        } else if (result.success) {
            elements.postsList.innerHTML = `
                <div class="empty-state">
                    <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-accent-100 dark:bg-accent-500/10 flex items-center justify-center">
                        <i data-lucide="file-plus" class="w-6 h-6 text-accent-500"></i>
                    </div>
                    <h3>No posts yet</h3>
                    <p>Create your first blog post to get started!</p>
                </div>
            `;
            refreshIcons();
        } else {
            elements.postsList.innerHTML = '<p class="loading">Error loading posts.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        elements.postsList.innerHTML = '<p class="loading">Network error.</p>';
    }
}

// Make functions globally accessible
window.editPost = async function (slug) {
    try {
        const result = await fetchPost(slug);

        if (!result.success) {
            showToast('Failed to load post', 'error');
            return;
        }

        const post = result.post;

        // Switch to editor view
        elements.navBtns.forEach(b => b.classList.remove('active'));
        elements.navBtns[0].classList.add('active');
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        elements.editorView.classList.add('active');

        // Set edit mode
        editMode = true;
        editSlug = slug;
        elements.editSlugInput.value = slug;
        elements.editorTitle.textContent = 'Edit Post';
        elements.saveBtn.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i> Update Post';
        elements.cancelEdit.style.display = 'inline-flex';

        // Fill form
        elements.title.value = post.title || '';
        elements.date.value = formatDateForInput(post.date);
        elements.description.value = post.description || '';
        elements.author.value = post.author || 'Yu Xuan Low';

        // Set author image
        elements.authorImageInput.value = post.authorImage || 'profile.png';
        loadDefaultAuthorImage();

        // Set tags
        setTags(post.tags || []);

        elements.math.checked = post.math || false;
        elements.draft.checked = post.draft || false;

        // Handle featured image
        if (post.image) {
            elements.imageInput.value = post.image;
            elements.previewImg.src = `/images/${post.image}`;
            elements.imagePreview.classList.add('active');
            elements.imageUploadArea.style.display = 'none';
        }

        // Set content - convert markdown to HTML for Quill
        const contentHtml = markdownToHtml(post.content || '');
        quill.clipboard.dangerouslyPasteHTML(contentHtml);

        // Hide autosave status when editing
        if (elements.autosaveStatus) {
            elements.autosaveStatus.style.visibility = 'hidden';
        }

        showToast('Post loaded', 'success');
        refreshIcons();
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to load post', 'error');
    }
};

window.showDeleteConfirm = function (slug, title) {
    deleteSlug = slug;
    elements.deleteMessage.textContent = `Are you sure you want to delete "${title}"? This action cannot be undone.`;
    elements.deleteModal.classList.add('active');
};

async function handleDelete() {
    if (!deleteSlug) return;

    try {
        const result = await deletePost(deleteSlug);

        if (result.success) {
            showToast('Post deleted successfully', 'success');
            elements.deleteModal.classList.remove('active');
            deleteSlug = null;
            loadPosts();
            // Reload tags after deleting
            loadTagsFromPosts();
        } else {
            showToast(result.error || 'Failed to delete post', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

function showPreview() {
    elements.previewContent.textContent = generatePreview();
    elements.previewModal.classList.add('active');
}

function closePreview() {
    elements.previewModal.classList.remove('active');
}

function closeDeleteModal() {
    elements.deleteModal.classList.remove('active');
    deleteSlug = null;
}

// ========================================
// Initialize
// ========================================
async function init() {
    initTheme();
    initMetadataToggle();
    setDefaultDate();
    initImageUpload();
    initAuthorImageUpload();
    initTags();
    initAutosave();

    // Load tags from existing posts
    console.log('About to call loadTagsFromPosts...');
    await loadTagsFromPosts();
    console.log('loadTagsFromPosts completed. AVAILABLE_TAGS:', AVAILABLE_TAGS);

    // Event listeners
    elements.postForm.addEventListener('submit', handleFormSubmit);
    elements.navBtns.forEach(btn => btn.addEventListener('click', handleNavigation));
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.previewBtn.addEventListener('click', showPreview);
    elements.closePreview.addEventListener('click', closePreview);
    elements.refreshPosts.addEventListener('click', loadPosts);
    elements.cancelEdit.addEventListener('click', resetForm);
    elements.cancelDelete.addEventListener('click', closeDeleteModal);
    elements.confirmDelete.addEventListener('click', handleDelete);

    // Close modals on outside click
    elements.previewModal.addEventListener('click', (e) => {
        if (e.target === elements.previewModal) closePreview();
    });
    elements.deleteModal.addEventListener('click', (e) => {
        if (e.target === elements.deleteModal) closeDeleteModal();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePreview();
            closeDeleteModal();
        }
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            elements.postForm.dispatchEvent(new Event('submit'));
        }
    });

    console.log('Hugo CMS Editor initialized');
}

init();
