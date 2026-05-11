import axios from "axios"

const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";
const DEFAULT_MODEL = "mistral-small-latest";

export const askAi = async (messages) => {
    try {
        if(!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error("Messages array is empty.");
        }
        if (!process.env.MISTRAL_API_KEY) {
            throw new Error("MISTRAL_API_KEY is missing.");
        }

        const model = process.env.MISTRAL_MODEL || DEFAULT_MODEL;

        const response = await axios.post(MISTRAL_URL,
            {
                model,
                messages: messages

            },
            {
            headers: {
            Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
            'Content-Type': 'application/json',
        },});

        const content = response?.data?.choices?.[0]?.message?.content;

        if (!content || !content.trim()) {
      throw new Error("AI returned empty response.");
    }

    return content
    } catch (error) {
            console.error("Mistral Error:", error.response?.data || error.message);
    throw new Error("Mistral API Error");

    }
}