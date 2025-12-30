/**
 * Hugo CMS Editor - Main Application Entry Point
 * 
 * This file initializes the CMS and sets up event listeners.
 * All modules must be loaded before this file.
 */

// ========================================
// Initialize Application
// ========================================
async function init() {
    // Initialize modules
    initTheme();
    initMetadataToggle();
    setDefaultDate();
    initImageUpload();
    initAuthorImageUpload();
    initTags();
    initAutosave();

    // Load tags from existing posts
    await loadTagsFromPosts();

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

// Start the application
init();
