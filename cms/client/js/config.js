/**
 * Hugo CMS Editor - Configuration & State
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
let uploadedAuthorImageFile = null;
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
