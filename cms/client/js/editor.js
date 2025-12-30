/**
 * Hugo CMS Editor - Quill Editor with Markdown Shortcuts
 */

// ========================================
// Quill Editor Initialization
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

// ========================================
// Markdown Shortcuts Handler
// ========================================
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
        if (textBefore.length >= 4 && textBefore.endsWith('**')) {
            const searchText = textBefore.slice(0, -2);
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
        if (!textBefore.endsWith('**') && textBefore.length >= 2) {
            const searchText = textBefore.slice(0, -1);
            let openingIndex = -1;

            for (let i = searchText.length - 1; i >= 0; i--) {
                if (searchText[i] === '*') {
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
                        quill.formatLine(lineStart, 1, pattern.format);
                    }
                }, 0);
                return;
            }
        }
    }

    // 5. Special case for code block ```
    if (lineText.substring(0, cursorInLine) === '```') {
        setTimeout(() => {
            quill.deleteText(lineStart, 3);
            quill.formatLine(lineStart, 1, 'code-block', true);
        }, 0);
    }
});
