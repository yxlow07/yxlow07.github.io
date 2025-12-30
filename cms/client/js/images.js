/**
 * Hugo CMS Editor - Image Upload Handling
 */

// ========================================
// Author Image Upload
// ========================================
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
// Featured Image Upload
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
