/**
 * Hugo CMS Editor - Form and Post Management
 */

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
        preview += `tags: [${selectedTags.map(t => `"${t}"`).join(', ')}]\n`;
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

    // Show autosave status
    if (elements.autosaveStatus) {
        elements.autosaveStatus.style.visibility = 'visible';
    }

    refreshIcons();
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
