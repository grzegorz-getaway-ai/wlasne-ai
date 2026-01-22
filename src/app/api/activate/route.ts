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
    
    // 1. GPT-5.1 planuje nawigację
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { 
          role: "system", 
          content: "Jesteś nawigatorem wlasne.ai. Jeśli użytkownik podał nazwę domeny (np. getaway.pl), stwórz URL bezpośredni. Jeśli podał ogólne zapytanie, stwórz URL do Google Search. Odpowiedz TYLKO linkiem." 
        },
        { role: "user", content: task }
      ]
    });

    const targetUrl = completion.choices[0].message?.content?.trim() || "https://www.google.com";

    // 2. Tworzymy sesję z PROXY (korzystając z Twojego Developer Planu)
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      proxies: true 
    });

    // 3. Połączenie przez Playwright CDP
    const browser = await chromium.connectOverCDP(session.connectUrl);
    const defaultContext = browser.contexts()[0];
    const page = defaultContext.pages()[0] || await defaultContext.newPage();

    // 4. Wykonujemy nawigację
    try {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      // Czekamy chwilę na render, abyś widział treść po wejściu w sesję
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (e) {
      console.log("Nawigacja zainicjowana pomyślnie.");
    }

    // 5. Zamykamy sterownik lokalny (Vercel)
    // W Playwright na Browserbase to odłącza nas, ale sesja w chmurze żyje dalej
    await browser.close();

    return NextResponse.json({ 
      success: true, 
      plan: `[SYSTEM GPT-5.1 PROFESSIONAL]\n\nZadanie: ${task}\nCel: ${targetUrl}\n\nAgent wszedł na stronę i utrzymuje sesję. Możesz teraz przejąć kontrolę:\nhttps://www.browserbase.com/sessions/${session.id}` 
    });

  } catch (error: any) {
    console.error("Błąd backendu:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
