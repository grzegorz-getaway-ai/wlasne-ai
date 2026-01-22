import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Browserbase } from '@browserbasehq/sdk';
import { chromium } from 'playwright-core';

const MODEL_NAME = "gpt-5.1"; 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });

export async function POST(req: Request) {
  try {
    const { task } = await req.json();
    
    // 1. GPT-5.1 decyduje: czy to bezpośredni adres czy wyszukiwanie?
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { 
          role: "system", 
          content: "Jesteś nawigatorem wlasne.ai. Jeśli użytkownik podał nazwę strony (np. getaway.pl), stwórz URL bezpośredni. Jeśli nie, stwórz URL do Google Search. Odpowiedz TYLKO linkiem." 
        },
        { role: "user", content: task }
      ]
    });

    const targetUrl = completion.choices[0].message?.content?.trim() || "https://www.google.com";

    // 2. Tworzymy sesję z PROXY (korzystamy z Twojego Developer Planu)
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      proxies: true 
    });

    // 3. Łączymy się przez Playwright CDP
    const browser = await chromium.connectOverCDP(session.connectUrl);
    const defaultContext = browser.contexts()[0];
    const page = defaultContext.pages()[0] || await defaultContext.newPage();

    // Ustawiamy polskie parametry, żeby bot widział polskie treści
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'pl-PL,pl;q=0.9'
    });

    // 4. Inicjujemy nawigację
    try {
      // Idziemy pod wskazany adres (np. bezpośrednio na getaway.pl)
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      // Dajemy botowi 3 sekundy na załadowanie grafik i treści
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (e) {
      console.log("Nawigacja zainicjowana, bot pracuje w chmurze.");
    }

    // WAŻNE: Usunąłem browser.close(). Sesja zostaje otwarta w stanie "Running".
    // Odłączamy się tylko lokalnie.
    await browser.disconnect();

    return NextResponse.json({ 
      success: true, 
      plan: `[SYSTEM GPT-5.1 DEVELOPER]\n\nZadanie: ${task}\nCel: ${targetUrl}\n\nAgent otworzył stronę i czeka na Ciebie. Sesja NIE zostanie zamknięta automatycznie.\n\nKLIKNIJ TUTAJ, ABY WEJŚĆ:\nhttps://www.browserbase.com/sessions/${session.id}` 
    });

  } catch (error: any) {
    console.error("Błąd:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
