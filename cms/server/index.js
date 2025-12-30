import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fileUpload from 'express-fileupload';

import postsRouter from './routes/posts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    abortOnLimit: true
}));

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// Serve images from static/images for preview
app.use('/images', express.static(path.join(__dirname, '../../static/images')));

// API Routes
app.use('/api/posts', postsRouter);

// Serve the editor UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 Hugo CMS Server running at http://localhost:${PORT}`);
    console.log(`📝 Open the editor at http://localhost:${PORT}\n`);
});
