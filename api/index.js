import express from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Initialize Groq with API key
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
    console.error('Error: GROQ_API_KEY is not set in environment variables.');
    throw new Error('Missing GROQ_API_KEY');
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

app.use(express.json());

// Serve static files from /public
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running', port, apiKeySet: !!GROQ_API_KEY });
});

// Chat API endpoint
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
        console.error('Groq API Error:', error.message);
        res.status(500).json({ error: `Failed to get response from Groq: ${error.message}` });
    }
});

// Serve index.html for root path (fallback for static serving)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Catch-all for other routes (404 as JSON)
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Serverless export: Vercel invokes this as the handler
export default app;