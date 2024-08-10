// chat.ts
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: 'OPENAI_API_KEY',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    const { message, image } = req.body;

    if (!message && !image) {
        res.status(400).json({ error: 'Message or image is required' });
        return;
    }

    try {
        let messages: OpenAI.Chat.ChatCompletionMessageParam[];
        
        if (image) {
            messages = [
                {
                    role: "user",
                    content: [
                        { type: "text", text: message || "Analyze this image" },
                        { type: "image_url", image_url: { url: image } }
                    ],
                },
            ];
        } else {
            messages = [{ role: "user", content: message }];
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: messages,
            max_tokens: 300,
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