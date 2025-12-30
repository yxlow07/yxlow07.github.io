/**
 * Hugo CMS Editor - Utility Functions
 */

// ========================================
// Toast Notifications
// ========================================
function showToast(message, type = 'success') {
    elements.toast.textContent = message;
    elements.toast.className = `fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-md text-base text-white font-medium z-[2000] shadow-lg transition-all duration-200 toast ${type} show`;
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 2500);
}

// ========================================
// Date Formatting
// ========================================
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

function setDefaultDate() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60 * 1000);
    elements.date.value = localDate.toISOString().slice(0, 16);
}

// ========================================
// HTML Escaping
// ========================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// Icon Refresh
// ========================================
function refreshIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}
