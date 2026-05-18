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
      Act as an Expert E-commerce Reputation Manager. Your task is to analyze customer reviews, auto-detect their sentiment, select the appropriate response tone, and generate exactly 3 distinct variations of the reply.

      ### TONEMAPPING RULES:
      - If Sentiment is NEGATIVE -> Select tone "Apologetic". Tone style: empathetic, solution-oriented, take responsibility, acknowledge the issue, and offer assistance.
      - If Sentiment is POSITIVE -> Select tone "Friendly". Tone style: enthusiastic, grateful, thank the customer, and reinforce their positive experience.
      - If Sentiment is NEUTRAL -> Select tone "Professional". Tone style: polite, objective, helpful, clear, and concise.

      ### BUSINESS CONTEXT:
      - Business Name: ${businessProfile?.business_name || 'Our Business'}
      - Industry: ${businessProfile?.industry || 'Service/Retail'}
      - Company Website: ${businessProfile?.website || 'Not Specified'}
      - USPs: ${businessProfile?.usps || 'Quality service and customer satisfaction'}

      ### INTEGRATION RULES:
      - Intelligently mention the Business Name and Company Website in the generated replies ONLY if it flows naturally, makes sense, and is highly professional.
      - Never force the website if the customer review is negative or complaining (as it would look spammy or insensitive). In negative/apologetic reviews, focus strictly on resolving their issue with sincere empathy.
      - Do not include any placeholders like "[Customer Name]" or "[Your Company]" in the replies. Generate complete, polished, ready-to-use responses.

      ### DATA INPUT:
      Review Text: "${reviewText}"
      Language: "${language}"
      Platform: "${platform}"

      ### OUTPUT FORMAT (STRICT JSON ONLY):
      Return ONLY a valid JSON object matching the following structure exactly. Do not include prose, markdown code blocks, or conversational filler.

      {
        "detected_sentiment": "Positive | Negative | Neutral",
        "selected_tone": "Friendly | Apologetic | Professional",
        "replies": [
          "Variation 1 text...",
          "Variation 2 text...",
          "Variation 3 text..."
        ]
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
          { role: "system", content: "You are a professional e-commerce reputation manager. Output ONLY valid JSON matching the schema." },
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

    let score = 0.0;
    if (data.detected_sentiment === 'Positive') score = 1.0;
    if (data.detected_sentiment === 'Negative') score = -1.0;

    return {
      analysis: {
        sentiment: data.detected_sentiment,
        score: score,
        category: 'General Feedback',
        themes: [],
        language: language
      },
      replies: data.replies || [],
      selectedTone: data.selected_tone,
      fullResponse: data
    };
  } catch (error) {
    console.error("AI Engine Error (Groq):", error);
    throw error;
  }
};
