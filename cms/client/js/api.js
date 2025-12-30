/**
 * Hugo CMS Editor - API Functions
 */

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
