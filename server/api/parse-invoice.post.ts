import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || ''
});

// The strict system prompt forcing Groq to act as a JSON-only parser
const SYSTEM_PROMPT = `
AI Invoice Parser:

Input: current invoice JSON + user instruction  
Output: JSON of only changed fields for a partial update

Rules:
1. JSON only, no text/markdown
2. Include only fields that changed
3. If client name given without email, infer name@client.com
4. New items must have: name, priceStr (comma format), priceNum (int), qty (int), tax
5. If removing item, return full "lineItems" array without that item
6. If instruction unrelated to invoices, return exactly: {"error":"I can only help with creating and managing your invoices."}
`;

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { currentFormState, instruction } = body;

        // Check if API key exists before attempting call
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === '') {
            return {
                status: 'error',
                message: 'GROQ_API_KEY is not configured in the `.env` file.'
            };
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT
                },
                {
                    role: 'user',
                    content: `CURRENT STATE:\n${JSON.stringify(currentFormState, null, 2)}\n\nUSER INSTRUCTION:\n"${instruction}"`
                }
            ],
            // Use Llama 3.3 70B for fast, cheap inference
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1, // Low temperature for deterministic output
            // Force JSON response
            response_format: { type: 'json_object' }
        });

        const reply = chatCompletion.choices[0]?.message?.content || '{}';

        // Ensure it's valid JSON
        const parsedUpdate = JSON.parse(reply);

        return {
            status: 'success',
            update: parsedUpdate
        };

    } catch (error: any) {
        console.error('Groq parsing error:', error);
        return {
            status: 'error',
            message: error.message || 'Failed to parse instructions with AI.'
        };
    }
});
