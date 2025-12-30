/**
 * Hugo CMS Editor - Theme Management
 */

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
