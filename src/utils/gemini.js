const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const analyzeReview = async (review) => {
  if (!review || review.length < 5) return null;
  
  try {
    const prompt = `Analyze this customer review and return ONLY a JSON object with: 
    - "sentiment": "positive", "negative", or "neutral"
    - "suggestedTone": "Friendly" (for positive), "Apologetic" (for negative), or "Professional" (for neutral)
    - "emoji": single matching emoji
    
    Review: "${review}"`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Fast model for real-time analysis
        messages: [{ role: 'user', content: prompt }],
        temperature: 0, // Deterministic
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (err) {
    console.error("AI Analysis Failed:", err);
    // Simple fallback
    return { sentiment: 'neutral', suggestedTone: 'Professional', emoji: '😐' };
  }
};

export const generateReplies = async (review, tone, language, businessProfile = null) => {
  const businessName = businessProfile?.business_name || 'our business';
  const industry = businessProfile?.industry || 'General';
  const usps = businessProfile?.usps || 'quality service and customer satisfaction';

  const context = `You are a professional review response specialist for ${businessName}, a ${industry} business. Our key strengths are: ${usps}.`;

  const prompt = `${context}
Write a ${tone} response to this review: "${review}"
Generate exactly 3 different reply options.
Generate all 3 replies strictly in the selected language only (${language}).
Each reply must:
- acknowledge specific details from the review
- be personal and mention ${businessName} naturally or as a sign-off
- highlight our strengths: ${usps}
- be 50-80 words long
- sound human and natural
- end with an invitation to return.
Return only the 3 replies numbered 1, 2, 3.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Groq API error: ${response.status} - ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;
  const replies = text.split(/\d\.\s+/).filter(r => r.trim().length > 0);
  return replies.slice(0, 3).map(r => r.trim());
};
