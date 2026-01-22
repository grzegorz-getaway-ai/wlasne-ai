import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Browserbase } from '@browserbasehq/sdk';
import puppeteer from 'puppeteer-core';

// Używamy najnowszego modelu zgodnie z Twoją listą
const MODEL_NAME = "gpt-5.1"; 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });

export async function POST(req: Request) {
  try {
    const { task } = await req.json();
    
    // 1. GPT-5.1 przygotowuje precyzyjny link wyszukiwania
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { 
          role: "system", 
          content: "Jesteś nawigatorem wlasne.ai. Stwórz link do Google Search (https://www.google.com/search?q=...), który najlepiej rozwiąże zadanie. Odpowiedz TYLKO linkiem." 
        },
        { role: "user", content: task }
      ]
    });

    const targetUrl = completion.choices[0].message?.content?.trim() || "https://www.google.com";

    // 2. Tworzymy sesję w Browserbase
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
    });

    // 3. Łączymy się z przeglądarką
    const browser = await puppeteer.connect({
      browserWSEndpoint: session.connectUrl,
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // 4. KLUCZOWA ZMIANA: Czekamy, aż strona faktycznie zacznie się ładować
    // Używamy Promise.all, aby nie blokować sesji, ale wymusić start nawigacji
    await Promise.all([
      page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }),
      // Dajemy przeglądarce 2 sekundy na "narysowanie" pierwszych wyników
      new Promise(resolve => setTimeout(resolve, 2000)) 
    ]);

    // Zamykamy połączenie puppeteer, ale sesja w Browserbase zostaje otwarta
    await browser.disconnect();

    return NextResponse.json({ 
      success: true, 
      plan: `[SYSTEM GPT-5.1 POŁĄCZONY]\n\nCel: ${task}\nURL: ${targetUrl}\n\nPrzeglądarka załadowała wyniki wyszukiwania. Możesz teraz wejść w podgląd na żywo:\nhttps://www.browserbase.com/sessions/${session.id}` 
    });

  } catch (error: any) {
    console.error("Błąd:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
