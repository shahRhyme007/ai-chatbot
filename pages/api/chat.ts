// chat.ts
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: 'OPENAI_API_KEY',
});

const SYSTEM_MESSAGE = `You are a customer service chatbot for Royal Kitchen, a restaurant. 
Your primary goal is to assist customers with their inquiries about our food, services, and general information. 
If a customer asks for our email address, provide them with: royal.kitchen@gmail.com. 
If an image is uploaded, analyze it and determine if it's related to our restaurant's food. 
If it's not food-related or not from our restaurant, politely inform the customer.`;

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
        let messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: "system", content: SYSTEM_MESSAGE },
        ];
        
        if (image) {
            messages.push({
                role: "user",
                content: [
                    { type: "text", text: message || "Analyze this image" },
                    { type: "image_url", image_url: { url: image } }
                ],
            });
        } else {
            messages.push({ role: "user", content: message });
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