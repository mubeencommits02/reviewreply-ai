/**
 * Enterprise Reputation Management AI Engine (Groq/Llama Powered)
 * Optimized for high-conversion, empathetic, and professional replies.
 */
export const processReviewEnterprise = async (reviewText, language, platform = "Google", businessProfile = {}) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  const endpoint = "https://api.groq.com/openai/v1/chat/completions";

  if (!apiKey) {
    throw new Error("Groq API Key is missing. Please check your .env file.");
  }

  try {
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
      - Company Website: ${businessProfile?.website || 'Not Specified'}
      - USPs: ${businessProfile?.usps || 'Quality service and customer satisfaction'}

      ### INTEGRATION RULES:
      - Intelligently mention the Business Name and Company Website in the generated reply ONLY if it flows naturally, makes sense, and is highly professional.
      - Never force the website if the customer review is negative or complaining (as it would look spammy or insensitive). In negative reviews, focus strictly on resolving their issue with sincere empathy.

      ### DATA INPUT:
      Review Text: "${reviewText}"
      Language: "${language}"
      Platform: "${platform}"

      ### OUTPUT FORMAT (STRICT JSON ONLY):
      Return ONLY a valid JSON object. Do not include prose, markdown code blocks, or conversational filler.

      {
        "analysis": {
          "sentiment": "Positive | Negative | Neutral",
          "score": 0.0,
          "primary_issue": "string (max 5 words)",
          "themes": ["theme1", "theme2", "theme3"],
          "detected_language": "string"
        },
        "response": {
          "tone": "Empathetic | Professional | Enthusiastic",
          "generated_reply": "string",
          "call_to_action": "string"
        }
      }
    `;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a professional e-commerce reputation manager. Output ONLY valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Groq API Request Failed");
    }

    const result = await response.json();
    const data = JSON.parse(result.choices[0].message.content);

    return {
      analysis: {
        sentiment: data.analysis.sentiment,
        score: data.analysis.score,
        category: data.analysis.primary_issue,
        themes: data.analysis.themes || [],
        language: data.analysis.detected_language
      },
      replies: [data.response.generated_reply],
      cta: data.response.call_to_action,
      fullResponse: data
    };
  } catch (error) {
    console.error("AI Engine Error (Groq):", error);
    throw error;
  }
};
