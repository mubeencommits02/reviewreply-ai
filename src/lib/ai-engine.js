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
      Act as an Expert E-commerce Reputation Manager. Analyze the customer review below, auto-detect its sentiment, select the correct response tone, and generate EXACTLY 3 DISTINCT reply variations.

      ### MANDATORY REPLY RULES:
      - You MUST produce exactly 3 replies — no more, no less.
      - Each reply MUST be meaningfully different in phrasing, length, and angle. Do NOT repeat sentences or ideas across variations.
      - Variation 1 (Short): Concise, 40-55 words, warm opener, key acknowledgement, invitation to return.
      - Variation 2 (Medium): Balanced, 60-80 words, personal touch, mention a specific detail from the review, highlight a USP.
      - Variation 3 (Detailed): Thorough, 85-110 words, empathetic deep-dive, address the core point of the review, reinforce brand values, strong closing.

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
      - Intelligently mention the Business Name and Company Website in replies ONLY if it flows naturally.
      - Never force the website in negative/apologetic replies — focus on resolving the issue with sincere empathy.
      - Do NOT include placeholders like "[Customer Name]" or "[Your Company]". Generate complete, polished, ready-to-use responses.
      - Write all replies strictly in the language: ${language}.

      ### DATA INPUT:
      Review Text: "${reviewText}"
      Platform: "${platform}"

      ### OUTPUT FORMAT (STRICT JSON — NO MARKDOWN, NO PROSE):
      Return ONLY a valid JSON object with this exact structure. The "replies" array MUST contain exactly 3 string elements.

      {
        "detected_sentiment": "Positive | Negative | Neutral",
        "selected_tone": "Friendly | Apologetic | Professional",
        "replies": [
          "Short variation reply text here (40-55 words)...",
          "Medium variation reply text here (60-80 words)...",
          "Detailed variation reply text here (85-110 words)..."
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
          {
            role: "system",
            content: "You are a professional e-commerce reputation manager. You MUST output ONLY a valid JSON object — no markdown, no prose. The JSON must contain a 'replies' array with EXACTLY 3 distinct string elements representing three different reply variations. Failure to return exactly 3 replies is an error."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Groq API Request Failed");
    }

    const result = await response.json();
    const rawContent = result.choices[0]?.message?.content || "";
    // Bulletproof Markdown backtick parser to prevent parse/crash failures
    const cleanResponse = rawContent.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanResponse);

    let score = 0.0;
    if (data.detected_sentiment === 'Positive') score = 1.0;
    if (data.detected_sentiment === 'Negative') score = -1.0;

    // Runtime guard: ensure we always have exactly 3 reply strings
    const rawReplies = Array.isArray(data.replies) ? data.replies.filter(r => typeof r === 'string' && r.trim().length > 0) : [];
    if (rawReplies.length !== 3) {
      console.warn(`AI returned ${rawReplies.length} replies instead of 3. Check prompt compliance.`);
    }
    // Pad with fallback if needed so frontend never crashes
    while (rawReplies.length < 3) {
      rawReplies.push(rawReplies[0] || 'Thank you for your review! We appreciate your feedback and look forward to serving you again.');
    }
    const replies = rawReplies.slice(0, 3);

    return {
      analysis: {
        sentiment: data.detected_sentiment,
        score: score,
        category: 'General Feedback',
        themes: [],
        language: language
      },
      replies,
      selectedTone: data.selected_tone,
      fullResponse: data
    };
  } catch (error) {
    console.error("AI Engine Error (Groq):", error);
    throw error;
  }
};
