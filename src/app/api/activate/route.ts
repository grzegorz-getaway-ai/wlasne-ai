import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Browserbase } from '@browserbasehq/sdk';
import { chromium } from 'playwright-core';

// Najpotężniejszy model GPT-5.1 do planowania
const MODEL_NAME = "gpt-5.1"; 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });

export async function POST(req: Request) {
  try {
    const { task } = await req.json();
    
    // 1. GPT-5.1 przygotowuje URL
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { 
          role: "system", 
          content: "Jesteś nawigatorem wlasne.ai. Stwórz link do Google Search (https://www.google.com/search?q=...), który rozwiąże zadanie. Odpowiedz TYLKO linkiem." 
        },
        { role: "user", content: task }
      ]
    });

    const targetUrl = completion.choices[0].message?.content?.trim() || "https://www.google.com";

    // 2. Tworzymy sesję (proxies: false dla planu Free)
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      proxies: false 
    });

    // 3. Łączymy się przez Playwright CDP
    const browser = await chromium.connectOverCDP(session.connectUrl);
    const defaultContext = browser.contexts()[0];
    const page = defaultContext.pages()[0] || await defaultContext.newPage();

    // 4. Inicjujemy nawigację pod okiem GPT-5.1
    try {
      // Wydajemy komendę "leć do"
      await page.goto(targetUrl, { waitUntil: 'commit', timeout: 8000 });
      
      // Dajemy chwilę na załadowanie pierwszych wyników na ekran
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e) {
      console.log("Nawigacja trwa w tle w chmurze.");
    }

    // WAŻNE: Nie wywołujemy browser.close(). 
    // Dzięki temu połączenie zostanie przerwane przez Vercel, 
    // ale sesja w Browserbase będzie żyć dalej dla użytkownika.

    return NextResponse.json({ 
      success: true, 
      plan: `[SYSTEM GPT-5.1 ONLINE]\n\nZadanie: ${task}\nCel: ${targetUrl}\n\nPrzeglądarka w chmurze została uruchomiona. Możesz teraz wejść w podgląd na żywo:\nhttps://www.browserbase.com/sessions/${session.id}` 
    });

  } catch (error: any) {
    console.error("Błąd backendu:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
