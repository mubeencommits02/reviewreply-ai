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
  let context = "You are an expert business reputation manager with 10 years of experience.";
  
  if (businessProfile && businessProfile.business_name) {
    context = `You are a professional reputation manager for "${businessProfile.business_name}". 
    Business Details:
    - Industry: ${businessProfile.industry_type || 'General'}
    - Description: ${businessProfile.business_description || 'A quality business'}
    - Preferred Tone: ${businessProfile.preferred_tone || tone}
    
    Reply to this customer review personally and professionally on behalf of the business.`;
  }

  const prompt = `${context}
When given a customer Google review, generate exactly 3 different reply options in the selected tone: "${tone}".
Generate all 3 replies strictly in the selected language only (${language}).
Each reply must:
- start differently
- acknowledge specific details from the review
- be personal and highlight the business's unique value
- be 50-80 words long
- sound human and natural not robotic
- end with an invitation to return or contact directly.
Return only the 3 replies numbered 1, 2, 3 — nothing else.
Customer Review: "${review}"`;

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
