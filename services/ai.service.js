const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Customer Support Assistant System Prompt
 */
const SYSTEM_PROMPT = `You are Kiara, a professional, empathetic, intelligent, and concise AI Customer Support Assistant.
Your primary role is to assist users with their inquiries, provide clear solutions, and maintain a warm, confident, and polite tone.
Follow these guidelines strictly:
1. Be helpful, concise, and direct in your answers.
2. Keep responses focused on customer support and technical assistance.
3. If an inquiry is unclear, ask polite clarifying questions.
4. Maintain a professional yet friendly conversational tone.`;

/**
 * Generate AI response using Google Gemini API with history context.
 * 
 * @param {Array<{role: string, content: string}>} history - Previous messages
 * @param {string} currentMessage - The new incoming user message
 * @returns {Promise<string>} - The assistant's response text
 */
const generateSupportResponse = async (history = [], currentMessage) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[AI Service Error] GEMINI_API_KEY is not defined in environment variables.');
      return "I'm currently undergoing maintenance (API configuration issue). Please try again in a few moments!";
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Supported Gemini model candidates (trying latest active free-tier models first)
    const MODEL_CANDIDATES = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ];

    const recentHistory = history.slice(-10);
    const formattedHistory = recentHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    let responseText = null;
    let lastError = null;

    // Loop through model candidates until one succeeds
    for (const modelName of MODEL_CANDIDATES) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_PROMPT
        });

        const chat = model.startChat({
          history: formattedHistory
        });

        const result = await chat.sendMessage(currentMessage);
        const response = await result.response;
        responseText = response.text();

        if (responseText) {
          console.log(`[AI Service] Response generated successfully using model: ${modelName}`);
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`[AI Service Warning] Model '${modelName}' failed (${err.status || err.message}). Trying next candidate...`);
      }
    }

    if (!responseText) {
      throw lastError || new Error('All Gemini model candidates failed.');
    }

    if (!responseText) {
      return "I apologize, but I couldn't generate a response. How else may I help you?";
    }

    return responseText.trim();
  } catch (error) {
    console.error('[AI Service Error] Full error details:');
    console.error('  Message:', error.message);
    console.error('  Status:', error.status || 'N/A');
    console.error('  StatusText:', error.statusText || 'N/A');
    console.error('  Error details:', JSON.stringify(error.errorDetails || error.response?.data || 'N/A'));
    console.error('  API Key loaded:', !!process.env.GEMINI_API_KEY);
    console.error('  API Key prefix:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'NOT SET');
    // Return a fallback user-friendly message rather than crashing
    return "I'm sorry, I encountered a temporary network or API issue while processing your request. Please try asking again.";
  }
};

module.exports = {
  generateSupportResponse,
  SYSTEM_PROMPT
};
