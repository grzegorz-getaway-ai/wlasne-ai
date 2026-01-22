import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Browserbase } from '@browserbasehq/sdk';
import puppeteer from 'puppeteer-core';

// Korzystamy z najpotężniejszego modelu GPT-5.1
const MODEL_NAME = "gpt-5.1"; 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });

export async function POST(req: Request) {
  try {
    const { task } = await req.json();
    
    // 1. GPT-5.1 tworzy precyzyjny URL wyszukiwania
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

    // 3. Łączymy się przez Puppeteer, aby wydać komendę "Idź do"
    const browser = await puppeteer.connect({
      browserWSEndpoint: session.connectUrl,
    });

    const page = await browser.newPage();
    
    // Wydajemy komendę nawigacji
    // NIE używamy await page.goto, żeby Vercel nie czekał na załadowanie całej strony (co grozi timeoutem)
    page.goto(targetUrl).catch(() => {});

    // WAŻNE: Nie wywołujemy browser.disconnect() ani browser.close()
    // Chcemy, żeby sesja została "osierocona" w stanie aktywnym dla użytkownika.

    return NextResponse.json({ 
      success: true, 
      plan: `[SYSTEM GPT-5.1 POŁĄCZONY]\n\nCel: ${task}\nURL: ${targetUrl}\n\nAgent właśnie otwiera przeglądarkę i wczytuje wyniki w chmurze.\nKliknij w poniższy link, aby przejąć kontrolę:\nhttps://www.browserbase.com/sessions/${session.id}` 
    });

  } catch (error: any) {
    console.error("Błąd backendu:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
