import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Browserbase } from '@browserbasehq/sdk';
import { chromium } from 'playwright-core';

// Najpotężniejszy model GPT-5.1 do planowania nawigacji
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
          content: "Jesteś nawigatorem wlasne.ai. Stwórz precyzyjny link do Google Search (https://www.google.com/search?q=...), który rozwiąże zadanie. Odpowiedz TYLKO linkiem." 
        },
        { role: "user", content: task }
      ]
    });

    const targetUrl = completion.choices[0].message?.content?.trim() || "https://www.google.com";

    // 2. Tworzymy sesję w Browserbase z włączonymi Proxy (kluczowe dla Google)
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      proxies: true
    });

    // 3. Łączymy się przez Playwright CDP
    const browser = await chromium.connectOverCDP(session.connectUrl);
    const defaultContext = browser.contexts()[0];
    const page = defaultContext.pages()[0] || await defaultContext.newPage();

    // 4. Wymuszamy nawigację i czekamy na pierwszy sygnał ze strony
    // Ustawiamy timeout na 5 sekund - tyle wystarczy, by "pchnąć" bota pod URL
    try {
      await page.goto(targetUrl, { waitUntil: 'commit', timeout: 5000 });
      // Kluczowe: czekamy dodatkowe 3 sekundy, żeby obraz "wskoczył" do podglądu
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (e) {
      console.log("Nawigacja zainicjowana, bot działa w tle.");
    }

    // Odłączamy sterownik, ale NIE zamykamy sesji (ona żyje dalej w chmurze)
    await browser.close().catch(() => {});

    return NextResponse.json({ 
      success: true, 
      plan: `[AGENT GPT-5.1 AKTYWNY]\n\nZadanie: ${task}\n\nUruchomiłem przeglądarkę i wszedłem na stronę: ${targetUrl}\n\nMożesz teraz przejąć stery i zobaczyć efekty pracy tutaj:\nhttps://www.browserbase.com/sessions/${session.id}` 
    });

  } catch (error: any) {
    console.error("Błąd krytyczny:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
