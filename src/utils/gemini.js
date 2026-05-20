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

  const prompt = `You are a professional review response specialist for ${businessName}, a ${industry} business. Our key strengths are: ${usps}.

Write a ${tone} response to this customer review: "${review}"

You MUST generate EXACTLY 3 distinct reply variations. Each must:
- Be meaningfully different in phrasing, structure, and length from the others.
- Acknowledge specific details from the review.
- Mention "${businessName}" naturally (as an opener or sign-off).
- Highlight strengths: ${usps}.
- Sound human and natural, end with an invitation to return.
- Be written strictly in: ${language}.
- Variation 1: Short (40-55 words).
- Variation 2: Medium (60-80 words).
- Variation 3: Detailed (85-110 words).

Return ONLY a valid JSON object — no markdown, no prose:
{
  "replies": [
    "Short reply here...",
    "Medium reply here...",
    "Detailed reply here..."
  ]
}`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a professional review response specialist. Output ONLY valid JSON with a "replies" array containing EXACTLY 3 distinct string elements.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Groq API error: ${response.status} - ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  const rawReplies = Array.isArray(parsed.replies)
    ? parsed.replies.filter(r => typeof r === 'string' && r.trim().length > 0)
    : [];

  // Runtime guard: always return exactly 3 replies
  while (rawReplies.length < 3) {
    rawReplies.push(rawReplies[0] || 'Thank you for your review! We truly appreciate your feedback and look forward to serving you again.');
  }
  return rawReplies.slice(0, 3).map(r => r.trim());
};
