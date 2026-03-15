const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const analyzeSentiment = (review) => {
  const negative = ['bad', 'worst', 'terrible', 'horrible', 'awful', 'disappointed', 'slow', 'rude', 'never', 'poor', 'pathetic', 'waste', 'horrible', 'disgusting'];
  const positive = ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'loved', 'best', 'perfect', 'outstanding', 'brilliant', 'awesome'];
  const text = review.toLowerCase();
  let negScore = negative.filter(w => text.includes(w)).length;
  let posScore = positive.filter(w => text.includes(w)).length;
  if (negScore > posScore) return 'negative';
  if (posScore > negScore) return 'positive';
  return 'neutral';
};

const getTonesuggestion = (sentiment) => {
  if (sentiment === 'negative') return 'Apologetic';
  if (sentiment === 'positive') return 'Friendly';
  return 'Professional';
};

export const analyzeReview = (review) => {
  const sentiment = analyzeSentiment(review);
  return {
    sentiment,
    suggestedTone: getTonesuggestion(sentiment),
    emoji: sentiment === 'negative' ? '😤' : sentiment === 'positive' ? '😊' : '😐'
  };
};

export const generateReplies = async (review, tone, language) => {
  const prompt = `You are an expert business reputation manager with 10 years of experience.
When given a customer Google review, generate exactly 3 different reply options in the selected tone: "${tone}".
Generate all 3 replies strictly in the selected language only (${language}). If Arabic is selected, write in Arabic script. If Urdu is selected, write in Urdu script. If Hindi is selected, write in Devanagari script. If English is selected, write in English.
Each reply must:
- start differently
- acknowledge specific details from the review
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
