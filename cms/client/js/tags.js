/**
 * Hugo CMS Editor - Tags Management
 */

// ========================================
// Dynamic Tags from Posts
// ========================================
async function loadTagsFromPosts() {
    try {
        const result = await fetchPosts();
        if (result.success && result.posts) {
            const allTags = new Set();
            result.posts.forEach(post => {
                if (post.tags && Array.isArray(post.tags)) {
                    post.tags.forEach(tag => allTags.add(tag.toLowerCase()));
                }
            });
            AVAILABLE_TAGS = Array.from(allTags).sort();
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
