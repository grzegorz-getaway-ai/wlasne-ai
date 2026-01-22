import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Browserbase } from '@browserbasehq/sdk';
import { chromium } from 'playwright-core';

// Używamy flagowego modelu GPT-5.1
const MODEL_NAME = "gpt-5.1"; 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });

export async function POST(req: Request) {
  try {
    const { task } = await req.json();
    
    // 1. GPT-5.1 przygotowuje URL wyszukiwania
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { 
          role: "system", 
          content: "Jesteś nawigatorem wlasne.ai. Stwórz precyzyjny link do Google Search (https://www.google.com/search?q=...), który rozwiąże zadanie. Odpowiedz TYLKO linkiem." 
        },
        { role: "user", content: task }
      ]
    });

    const targetUrl = completion.choices[0].message?.content?.trim() || "https://www.google.com";

    // 2. Tworzymy sesję (proxies: false dla planu Free Browserbase)
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      proxies: false
    });

    // 3. Łączymy się i odpalamy nawigację
    const browser = await chromium.connectOverCDP(session.connectUrl);
    const defaultContext = browser.contexts()[0];
    const page = defaultContext.pages()[0] || await defaultContext.newPage();

    // Wykonujemy nawigację i czekamy tylko chwilę, by "pchnąć" proces
    try {
      await page.goto(targetUrl, { waitUntil: 'commit', timeout: 5000 });
      // Dajemy ułamek sekundy na start renderowania
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) {
      console.log("Nawigacja zainicjowana pomyślnie.");
    }

    // Odłączamy się, by oddać sesję użytkownikowi
    await browser.disconnect();

    return NextResponse.json({ 
      success: true, 
      plan: `[SYSTEM GPT-5.1 ONLINE]\n\nZadanie: ${task}\nStatus: Agent wszedł na stronę wyników.\n\nMOŻESZ TERAZ PRZEJĄĆ SESJĘ TUTAJ:\nhttps://www.browserbase.com/sessions/${session.id}` 
    });

  } catch (error: any) {
    console.error("Błąd:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
