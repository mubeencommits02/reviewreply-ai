import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GROQ_API_KEY);

/**
 * Enterprise Reputation Management AI Engine
 * Uses Google Gemini for high-conversion, empathetic, and professional replies.
 */
export const processReviewEnterprise = async (reviewText, language, platform = "Google", businessProfile = {}) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      Act as an Expert E-commerce Reputation Manager. Your task is to analyze customer reviews and generate high-conversion, empathetic, and professional replies.

      ### OBJECTIVE:
      1. Perform deep sentiment analysis.
      2. Extract the core "Pain Point" or "Value Driver."
      3. Generate a contextual reply in the user's language.

      ### ANALYSIS RULES:
      - **Positive Sentiment**: Focus on gratitude and brand loyalty.
      - **Negative Sentiment**: Acknowledge the specific issue, express genuine empathy, and offer a professional resolution.
      - **Neutral Sentiment**: Acknowledge the feedback and ask for specific ways to improve.

      ### BUSINESS CONTEXT:
      - Business Name: ${businessProfile?.business_name || 'Our Business'}
      - Industry: ${businessProfile?.industry || 'Service/Retail'}
      - USPs: ${businessProfile?.usps || 'Quality service and customer satisfaction'}

      ### DATA INPUT:
      Review Text: "${reviewText}"
      Language: "${language}"
      Platform: "${platform}"

      ### OUTPUT FORMAT (STRICT JSON ONLY):
      Return ONLY a valid JSON object.

      {
        "analysis": {
          "sentiment": "Positive | Negative | Neutral",
          "score": 0.0 to 1.0,
          "primary_issue": "string (max 5 words)",
          "detected_language": "string"
        },
        "response": {
          "tone": "Empathetic | Professional | Enthusiastic",
          "generated_reply": "string",
          "call_to_action": "string"
        }
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const data = JSON.parse(response.text());

    return {
      analysis: {
        sentiment: data.analysis.sentiment,
        score: data.analysis.score,
        category: data.analysis.primary_issue, // Map for backward compatibility if needed
        language: data.analysis.detected_language
      },
      replies: [data.response.generated_reply], // Return as array for compatibility
      cta: data.response.call_to_action,
      fullResponse: data
    };
  } catch (error) {
    console.error("AI Engine Error:", error);
    throw error;
  }
};

