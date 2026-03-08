import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const PUBLIC_DIR = path.join(__dirname, 'public');
const AUDIO_DIR = path.join(PUBLIC_DIR, 'audio');
const SPACES_JSON_PATH = path.join(PUBLIC_DIR, 'spaces.json');

// Ensure audio directory exists
if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

// Get all spaces
app.get('/api/spaces', (req, res) => {
    try {
        if (!fs.existsSync(SPACES_JSON_PATH)) {
            return res.json([]);
        }
        const data = fs.readFileSync(SPACES_JSON_PATH, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading spaces.json:', error);
        res.status(500).json({ error: 'Failed to read spaces data' });
    }
});

// Download and add space
app.post('/api/spaces/download', async (req, res) => {
    const { url, title, description, date } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const timestamp = Date.now();
        const outputFilename = `space_${timestamp}.m4a`;
        const outputPath = path.join(AUDIO_DIR, outputFilename);

        // Using basic yt-dlp command. Needs yt-dlp installed on system, or we could use yt-dlp-exec package.
        // For simplicity and matching user's likely environment, we'll try yt-dlp through npx yt-dlp-exec if local isn't available
        console.log(`Starting download for ${url}...`);

        // Command to download audio only using yt-dlp
        const cmd = `npx yt-dlp-exec -f "bestaudio[ext=m4a]/bestaudio/best" -o "${outputPath}" "${url}"`;

        // Quick mock response for testing if actual download fails or for faster development iteration
        if (url.includes('example')) {
            console.log('Mock download for example URL');
            fs.writeFileSync(outputPath, 'mock audio content for testing'); // Create dummy file
        } else {
            await execPromise(cmd);
        }
        console.log(`Download complete: ${outputFilename}`);

        // Read current spaces
        let spaces = [];
        if (fs.existsSync(SPACES_JSON_PATH)) {
            spaces = JSON.parse(fs.readFileSync(SPACES_JSON_PATH, 'utf8'));
        }

        const newSpace = {
            id: spaces.length > 0 ? Math.max(...spaces.map(s => s.id)) + 1 : 1,
            date: date || new Date().toISOString().split('T')[0].replace(/-/g, '.'),
            title: title || 'Untitled Space',
            description: description || '',
            duration: 'Unknown', // We could try to probe this, but keep it simple for now
            url: url,
            audioFile: `audio/${outputFilename}`
        };

        spaces.unshift(newSpace); // Add to beginning

        fs.writeFileSync(SPACES_JSON_PATH, JSON.stringify(spaces, null, 2));

        res.json({ success: true, space: newSpace });

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to download space', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
