import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import slugify from 'slugify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Paths
const BLOG_DIR = path.resolve(__dirname, '../../../content/blog');
const IMAGES_DIR = path.resolve(__dirname, '../../../static/images');

/**
 * Generate Hugo frontmatter in YAML format
 */
function generateFrontmatter(data) {
    const now = new Date().toISOString();
    const lines = ['---'];

    lines.push(`lastMod: "${data.lastMod || now}"`);
    lines.push(`title: "${escapeYamlString(data.title)}"`);
    lines.push(`date: ${data.date}`);
    lines.push(`draft: ${data.draft === 'true' || data.draft === true}`);
    lines.push(`description: "${escapeYamlString(data.description || '')}"`);

    if (data.image) {
        lines.push(`image: "${data.image}"`);
    }

    lines.push(`author: "${data.author || 'Yu Xuan Low'}"`);
    lines.push(`authorImage: "${data.authorImage || 'profile.png'}"`);
    lines.push(`math: ${data.math === 'true' || data.math === true}`);

    const tags = parseTags(data.tags);
    if (tags.length > 0) {
        lines.push('tags:');
        lines.push('  [');
        tags.forEach((tag, i) => {
            const comma = i < tags.length - 1 ? ',' : '';
            lines.push(`    "${tag}"${comma}`);
        });
        lines.push('  ]');
    }

    lines.push('---');
    return lines.join('\n');
}

function escapeYamlString(str) {
    return str.replace(/"/g, '\\"');
}

function parseTags(tags) {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    return tags.split(',').map(t => t.trim()).filter(Boolean);
}

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content) {
    // Normalize line endings to LF
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    const match = normalizedContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { frontmatter: {}, content: normalizedContent };

    const yamlContent = match[1];
    const bodyContent = match[2];

    const frontmatter = {};

    // Parse simple key-value pairs
    const simpleMatches = yamlContent.matchAll(/^(\w+):\s*["']?([^"'\n\[]+)["']?$/gm);
    for (const m of simpleMatches) {
        let value = m[2].trim();
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        frontmatter[m[1]] = value;
    }

    // Parse tags array
    const tagsMatch = yamlContent.match(/tags:\s*\[([\s\S]*?)\]/);
    if (tagsMatch) {
        const tagsContent = tagsMatch[1];
        // Split by comma and clean up quotes and whitespace
        // Also remove trailing comma if present
        const extractedTags = tagsContent.split(',').map(t => {
            return t.trim().replace(/^["']|["']$/g, '').replace(/,$/, '');
        }).filter(t => t.length > 0);
        frontmatter.tags = extractedTags;
    } else {
        // Handle alternative array format
        // tags:
        //   - tag1
        //   - tag2
        const listMatch = yamlContent.match(/tags:\s*\n((?:\s*-\s*.*(?:\n|$))+)/);
        if (listMatch) {
            const listContent = listMatch[1];
            const extractedTags = listContent.split('\n').map(l => {
                return l.replace(/^\s*-\s*/, '').trim().replace(/^["']|["']$/g, '');
            }).filter(t => t.length > 0);
            frontmatter.tags = extractedTags;
        }
    }

    return { frontmatter, content: bodyContent.trim() };
}

/**
 * GET /api/posts - List all blog posts
 */
router.get('/', async (req, res) => {
    try {
        await fs.mkdir(BLOG_DIR, { recursive: true });
        const files = await fs.readdir(BLOG_DIR);
        const mdFiles = files.filter(f => f.endsWith('.md'));

        const posts = await Promise.all(mdFiles.map(async (file) => {
            const content = await fs.readFile(path.join(BLOG_DIR, file), 'utf-8');
            const { frontmatter } = parseFrontmatter(content);
            const slug = file.replace('.md', '');

            console.log(`[${file}] Extracted tags:`, frontmatter.tags);

            return {
                filename: file,
                slug,
                title: frontmatter.title || file,
                date: frontmatter.date || 'Unknown',
                draft: frontmatter.draft || false,
                tags: frontmatter.tags || []
            };
        }));

        // Sort by date descending
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({ success: true, posts });
    } catch (error) {
        console.error('Error listing posts:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/posts/:slug - Get a specific post
 */
router.get('/:slug', async (req, res) => {
    try {
        const filename = `${req.params.slug}.md`;
        const filepath = path.join(BLOG_DIR, filename);
        const content = await fs.readFile(filepath, 'utf-8');

        const { frontmatter, content: bodyContent } = parseFrontmatter(content);

        res.json({
            success: true,
            post: {
                ...frontmatter,
                content: bodyContent,
                slug: req.params.slug
            }
        });
    } catch (error) {
        res.status(404).json({ success: false, error: 'Post not found' });
    }
});

/**
 * POST /api/posts - Create a new blog post
 */
router.post('/', async (req, res) => {
    try {
        const { title, date, description, image, author, authorImage, math, draft, tags, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                error: 'Title and content are required'
            });
        }

        const slug = slugify(title, { lower: true, strict: true });
        const filename = `${slug}.md`;
        const filepath = path.join(BLOG_DIR, filename);

        // Check if file exists
        try {
            await fs.access(filepath);
            return res.status(409).json({
                success: false,
                error: `Post "${filename}" already exists`
            });
        } catch {
            // File doesn't exist, continue
        }

        // Handle image upload
        let imageName = image;
        if (req.files && req.files.featuredImage) {
            imageName = await saveImage(req.files.featuredImage, slug);
        }

        const frontmatter = generateFrontmatter({
            title, date, description,
            image: imageName,
            author, authorImage, math, draft, tags
        });

        const fileContent = `${frontmatter}\n\n${content}`;

        await fs.mkdir(BLOG_DIR, { recursive: true });
        await fs.writeFile(filepath, fileContent, 'utf-8');

        res.json({
            success: true,
            message: `Post created: ${filename}`,
            filepath: `content/blog/${filename}`
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/posts/:slug - Update an existing post
 */
router.put('/:slug', async (req, res) => {
    try {
        const oldSlug = req.params.slug;
        const { title, date, description, image, author, authorImage, math, draft, tags, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                error: 'Title and content are required'
            });
        }

        const oldFilepath = path.join(BLOG_DIR, `${oldSlug}.md`);

        // Check if old file exists
        try {
            await fs.access(oldFilepath);
        } catch {
            return res.status(404).json({
                success: false,
                error: 'Post not found'
            });
        }

        const newSlug = slugify(title, { lower: true, strict: true });
        const newFilename = `${newSlug}.md`;
        const newFilepath = path.join(BLOG_DIR, newFilename);

        // Handle image upload
        let imageName = image;
        if (req.files && req.files.featuredImage) {
            imageName = await saveImage(req.files.featuredImage, newSlug);
        }

        const frontmatter = generateFrontmatter({
            title, date, description,
            image: imageName,
            author, authorImage, math, draft, tags
        });

        const fileContent = `${frontmatter}\n\n${content}`;

        // Write new file
        await fs.writeFile(newFilepath, fileContent, 'utf-8');

        // Delete old file if slug changed
        if (oldSlug !== newSlug) {
            await fs.unlink(oldFilepath);
        }

        res.json({
            success: true,
            message: `Post updated: ${newFilename}`,
            filepath: `content/blog/${newFilename}`
        });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/posts/:slug - Delete a post
 */
router.delete('/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const filepath = path.join(BLOG_DIR, `${slug}.md`);

        await fs.unlink(filepath);

        res.json({
            success: true,
            message: `Post deleted: ${slug}.md`
        });
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        console.error('Error deleting post:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Save uploaded image to static/images
 */
async function saveImage(file, slug) {
    await fs.mkdir(IMAGES_DIR, { recursive: true });

    const ext = path.extname(file.name);
    const imageName = `${slug}${ext}`;
    const imagePath = path.join(IMAGES_DIR, imageName);

    await file.mv(imagePath);

    return imageName;
}

export default router;
