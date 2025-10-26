import express from 'express';
import Groq from 'groq-sdk';  // Correct import for official Groq SDK\
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

// Replace with your actual Groq API key (use environment variable in production)
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const groq = new Groq({ apiKey: GROQ_API_KEY });

app.use(express.json());
app.use(express.static('.')); // Serve static files (index.html)

app.post('/chat', async (req, res) => {
    const { message } = req.body;

    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile', // Updated to a currently supported model (replaces deprecated mixtral)
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
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get response from Groq' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});