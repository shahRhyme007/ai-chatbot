import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: '' // Use environment variable for API key
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    const { message } = req.body;

    if (!message) {
        res.status(400).json({ error: 'Message is required' });
        return;
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],
            max_tokens: 150,
            temperature: 0.7,
        });

        const responseContent = completion.choices[0]?.message?.content;

        if (responseContent) {
            res.status(200).json({ completion: responseContent.trim() });
        } else {
            res.status(500).json({ error: 'No response content from OpenAI' });
        }
    } catch (error) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ error: 'Error communicating with OpenAI API' });
    }
}