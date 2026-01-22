import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Browserbase } from '@browserbasehq/sdk';
import { chromium } from 'playwright-core';

// Najpotężniejszy model GPT-5.1
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

    // 2. Tworzymy sesję - UWAGA: proxies wyłączone dla planu FREE (naprawia błąd 402)
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      proxies: false 
    });

    // 3. Łączymy się przez Playwright CDP
    const browser = await chromium.connectOverCDP(session.connectUrl);
    const defaultContext = browser.contexts()[0];
    const page = defaultContext.pages()[0] || await defaultContext.newPage();

    // Ustawiamy nagłówki, żeby nie zostać zablokowanym bez proxy
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7'
    });

    // 4. Inicjujemy nawigację
    try {
      // Czekamy tylko do momentu wysłania żądania, żeby nie przekroczyć czasu Vercel
      await page.goto(targetUrl, { waitUntil: 'commit', timeout: 7000 });
      
      // Krótkie czekanie na render obrazu
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e) {
      console.log("Nawigacja trwa w tle...");
    }

    // WAŻNE: Używamy disconnect zamiast close, aby sesja żyła dalej w Browserbase
    await browser.disconnect();

    return NextResponse.json({ 
      success: true, 
      plan: `[AGENT GPT-5.1 AKTYWNY]\n\nZadanie: ${task}\nCel: ${targetUrl}\n\nSesja została pomyślnie utworzona. Kliknij w link poniżej, aby przejąć kontrolę i zobaczyć wyniki:\nhttps://www.browserbase.com/sessions/${session.id}` 
    });

  } catch (error: any) {
    console.error("Błąd krytyczny:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
