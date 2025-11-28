import { GoogleGenAI } from "@google/genai";
import { Friend } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSquadAvailability = async (friends: Friend[]): Promise<string> => {
  if (friends.length === 0) return "Спочатку додайте друзів до списку.";

  // Prepare data for the prompt using explicit schedules
  const squadData = friends.map(f => {
    return {
      name: f.name,
      availability: f.schedule.join("") // String of 0s and 1s representing 24h
    };
  });

  const prompt = `
    Ви - аналітик ігрового загону (Squad Leader). Ваше завдання - знайти найкращий час для спільної гри (рейд, матч) враховуючи графіки відключення світла.
    
    Дані про гравців (1 = є світло, 0 = немає світла, рядок представляє 24 години від 00:00 до 23:00):
    ${JSON.stringify(squadData, null, 2)}

    Проаналізуйте перетин графіків.
    1. Знайдіть проміжок часу (найдовший), коли максимальна кількість гравців має світло одночасно.
    2. Якщо всі мають світло одночасно, скажіть про це радісно.
    3. Якщо повного перетину немає, запропонуйте найкращий компроміс (наприклад, "Граємо без Олексія з 14:00 до 16:00").
    4. Використовуй геймерський сленг (рейд, катка, афк, буст, gg wp) та українську мову.
    5. Будь лаконічним, максимум 3 речення.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Не вдалося зв'язатися зі штабом AI. Спробуйте пізніше.";
  }
};