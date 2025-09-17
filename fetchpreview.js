import fs from "fs";
import fetch from "node-fetch";
import yaml from "js-yaml";
import * as cheerio from "cheerio";
import { globSync } from "glob";
import https from "https";
import http, { get } from "http";

const DATA_FILE = "data/linkpreviews.yml";
const WATCH_PATH = "content/**/*.md";

const httpsAgent = new https.Agent({
    // rejectUnauthorized: false, // Allow self-signed certificates
});

const COMMON_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "DNT": "1", // Do Not Track
    "Upgrade-Insecure-Requests": "1",
};

function loadYaml() {
    if (!fs.existsSync(DATA_FILE)) {
        if (!fs.existsSync("data")) {
            fs.mkdirSync("data");
        }
        return {};
    }
    return yaml.load(fs.readFileSync(DATA_FILE, "utf8")) || {};
}

function saveYaml(data) {
    try {
        fs.writeFileSync(DATA_FILE, yaml.dump(data), "utf8");
        console.log(`✅ Successfully updated ${DATA_FILE}`);
    } catch (error) {
        console.error(`❌ Error saving YAML file: ${error.message}`);
    }
}

/**
 * Checks if a URL points to a valid, accessible image.
 * @param {string} url The URL of the image to check.
 * @returns {Promise<boolean>} True if the image is valid, false otherwise.
 */
async function isValidImageUrl(url) {
    if (!url) {
        return false;
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to avoid rate limiting
    try {
        // Use a HEAD request to check headers without downloading the full image
        const res = await fetch(url, {
            agent: httpsAgent,
            method: 'HEAD',
            timeout: 5000, // 5-second timeout
            headers: COMMON_HEADERS,
        });

        if (!res.ok) {
            console.log(`- Image not found (status: ${res.status}): ${url}`);
            return false;
        }

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
            console.log(`- URL is not an image (type: ${contentType}): ${url}`);
            return false;
        }

        return true;
    } catch (error) {
        console.log(`- Error validating image URL ${url}: ${error.message}`);
        return false;
    }
}

async function fetchMetadata(url) {
    console.log(`🔎 Fetching metadata for: ${url}`);
    try {
        const res = await fetch(url, {
            agent: httpsAgent,
            headers: COMMON_HEADERS,
            timeout: 10000,
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const html = await res.text();
        const $ = cheerio.load(html);

        const getMeta = (name) =>
            $(`meta[property='${name}']`).attr("content") ||
            $(`meta[name='${name}']`).attr("content");

        const title = getMeta("og:title") || $("title").text().trim() || url;
        const description = getMeta("og:description") || getMeta("description") || "";
        let imageUrl = getMeta("og:image") || getMeta("twitter:image") || "";

        // Validate the image URL before adding it
        if (imageUrl) {
            // Resolve relative URLs (e.g., /images/foo.png) to absolute URLs
            const absoluteImageUrl = new URL(imageUrl, url).href;
            const isValid = await isValidImageUrl(absoluteImageUrl);
            if (isValid) {
                imageUrl = absoluteImageUrl; // Keep the valid, absolute URL
            } else {
                imageUrl = ""; // Discard the invalid URL
            }
        }

        if (!imageUrl) {
            console.log(`- No primary image found, searching for favicon for ${url}`);
            let faviconUrl =
                $('link[rel="icon"]').attr("href") ||
                $('link[rel="shortcut icon"]').attr("href");

            if (faviconUrl) {
                const absoluteFaviconUrl = new URL(faviconUrl, url).href;
                if (await isValidImageUrl(absoluteFaviconUrl)) {
                    imageUrl = absoluteFaviconUrl;
                }
            }

            // If still no favicon from <link> tag, try the default location
            if (!imageUrl) {
                const defaultFaviconUrl = new URL("/favicon.ico", url).href;
                if (await isValidImageUrl(defaultFaviconUrl)) {
                    imageUrl = defaultFaviconUrl;
                } else {
                    console.log(`- No valid favicon found for ${url}`);
                }
            }
        }

        console.log(`👍 Fetched successfully: ${title}`);
        return { url, title, description, image: imageUrl };

    } catch (error) {
        console.error(`❌ Failed to fetch metadata for ${url}. Reason: ${error.message}`);
        return null;
    }
}

// --- Main Execution Logic ---

async function run() {
    console.log("🚀 Starting link preview generation...");

    const files = globSync(WATCH_PATH);
    if (files.length === 0) {
        console.log(`No markdown files found in ${WATCH_PATH}. Exiting.`);
        return;
    }
    console.log(`📄 Found ${files.length} markdown file(s) to process.`);

    const previews = loadYaml();
    const allUrls = new Set();
    const regex = /\{\{<\s*linkpro\s+.*?url="([^"]+)".*?>\}\}/g;

    // 1. Collect all unique URLs from all markdown files
    for (const file of files) {
        const content = fs.readFileSync(file, "utf8");
        let match;
        while ((match = regex.exec(content)) !== null) {
            // Ignore empty URLs from your markdown file
            if (match[1]) {
                allUrls.add(match[1]);
            }
        }
    }

    // 2. Fetch metadata only for new URLs
    let needsUpdate = false;
    const fetchPromises = [];

    for (const url of allUrls) {
        if (!previews[url]) {
            console.log(`🔗 New link found: ${url}`);
            needsUpdate = true;
            fetchPromises.push(
                fetchMetadata(url).then(metadata => {
                    if (metadata) {
                        previews[url] = metadata;
                    }
                })
            );
        }
    }

    // 3. Wait for all fetches to complete and save if needed
    if (needsUpdate) {
        console.log(`\n⏳ Fetching metadata for ${fetchPromises.length} new link(s)...`);
        await Promise.all(fetchPromises);
        saveYaml(previews);
    } else {
        console.log("\n✨ All links are already up to date. No new previews needed.");
    }

    console.log("\n🏁 Script finished.");
}

run();