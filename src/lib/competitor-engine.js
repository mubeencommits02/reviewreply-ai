import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_GROQ_API_KEY,
  baseURL: import.meta.env.VITE_OPENAI_API_KEY ? undefined : 'https://api.groq.com/openai/v1',
  dangerouslyAllowBrowser: true,
});

/**
 * Competitor Intelligence Engine
 * Fetches public reviews and generates SWOT Analysis
 */
export const analyzeCompetitor = async (competitorUrl) => {
  try {
    // STAGE 1: Resilient Scraping (Simulated for this build)

    const mockReviews = [
      "The food was okay but the staff was very rude.",
      "Great location, but overpriced for what you get.",
      "Best pasta in town! Highly recommend.",
      "Wait time was over an hour on a Tuesday night.",
      "Clean place, friendly manager, but the music was too loud."
    ];

    // STAGE 2: SWOT Analysis via AI
    const prompt = `
      Analyze the following customer reviews for a competitor:
      ${mockReviews.join("\n")}
      
      Generate a SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats).
      Also provide a sentiment distribution (0-100 scale for Positive, Neutral, Negative).
      
      Return a JSON object:
      {
        "swot": { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] },
        "sentimentStats": { "positive": 70, "neutral": 20, "negative": 10 }
      }
    `;

    // Dynamic model selection: Use gpt-4o for OpenAI, llama-3.3-70b-versatile for Groq to prevent model 404 crashes
    const isUsingGroq = !import.meta.env.VITE_OPENAI_API_KEY;
    const modelName = isUsingGroq ? "llama-3.3-70b-versatile" : "gpt-4o";

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Competitor Engine Error:", error);
    throw error;
  }
};
