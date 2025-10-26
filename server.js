import express from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Groq with API key
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
    console.error('Error: GROQ_API_KEY is not set in environment variables.');
    process.exit(1);
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' folder

// Health check endpoint for debugging
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running', port, apiKeySet: !!GROQ_API_KEY });
});

app.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'No message provided' });
    }

    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'user',
                    content: message
                }
            ],
            temperature: 1,
            max_tokens: 8192,
            top_p: 1
        });

        const aiResponse = completion.choices[0].message.content;
        res.json({ response: aiResponse });
    } catch (error) {
        console.error('Groq API Error:', error.message, error.stack);
        res.status(500).json({ error: `Failed to get response from Groq: ${error.message}` });
    }
});

// Catch-all for 404 errors
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});