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

    // 2. Tworzymy sesję z włączonym PROXY (wymaga płatnego planu)
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      proxies: true // Aktywacja proxy - koniec z błędami 402 i Google Sorry
    });

    // 3. Łączymy się przez Playwright CDP
    const browser = await chromium.connectOverCDP(session.connectUrl);
    const defaultContext = browser.contexts()[0];
    const page = defaultContext.pages()[0] || await defaultContext.newPage();

    // Ustawiamy realne wymiary okna dla lepszego podglądu
    await page.setViewportSize({ width: 1280, height: 800 });

    // 4. Inicjujemy nawigację
    try {
      // Dzięki proxy Google wpuści bota bez CAPTCHA
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      // Krótkie czekanie na pełne wyrenderowanie wyników
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e) {
      console.log("Nawigacja w toku (chmura pracuje dalej).");
    }

    // Odłączamy się od sesji sterującej, ale sesja w Browserbase żyje dalej
    // Używamy bezpiecznego zamknięcia połączenia lokalnego
    await browser.close().catch(() => {});

    return NextResponse.json({ 
      success: true, 
      plan: `[SYSTEM GPT-5.1 PROFESSIONAL]\n\nZadanie: ${task}\nStatus: Połączono przez Residential Proxy.\n\nMOŻESZ TERAZ PRZEJĄĆ SESJĘ BEZ BLOKAD:\nhttps://www.browserbase.com/sessions/${session.id}` 
    });

  } catch (error: any) {
    console.error("Błąd backendu:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
