import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyBqVSz0M9ilgzRLDdmcL8zqbM91GX54TB0";
const genAI = new GoogleGenerativeAI(apiKey);

async function checkModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("hello");
    console.log("Gemini 1.5 Flash generated:", result.response.text());
  } catch (e) {
    console.error("Gemini 1.5 Flash access error:", e.message);
  }

  try {
    const list2 = await genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log("Gemini 2.0 Flash is accessible");
  } catch (e) {
    console.error("Gemini 2.0 Flash access error:", e.message);
  }
}

checkModels();
