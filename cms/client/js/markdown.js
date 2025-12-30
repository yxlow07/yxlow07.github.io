/**
 * Hugo CMS Editor - Markdown Conversion
 */

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
