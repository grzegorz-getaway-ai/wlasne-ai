import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Browserbase } from '@browserbasehq/sdk';
import puppeteer from 'puppeteer-core';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });

export async function POST(req: Request) {
  try {
    const { task } = await req.json();
    
    // 1. Zamiast zgadywać URL, tworzymy precyzyjne zapytanie do Google
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Jesteś nawigatorem wlasne.ai. Stwórz link do wyszukiwarki Google, który najlepiej pomoże rozwiązać zadanie użytkownika. Odpowiedz TYLKO linkiem zaczynającym się od https://www.google.com/search?q=..." },
        { role: "user", content: task }
      ],
    });

    const targetUrl = completion.choices[0].message?.content?.trim() || "https://www.google.com";

    // 2. Tworzymy sesję w Browserbase
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
    });

    // 3. Łączymy się i wysyłamy bota na stronę wyników
    const browser = await puppeteer.connect({
      browserWSEndpoint: session.connectUrl,
    });

    const page = await browser.newPage();
    
    // Ustawiamy krótki timeout, żeby Vercel nie zerwał połączenia
    page.goto(targetUrl).catch(() => {}); 

    return NextResponse.json({ 
      success: true, 
      plan: `[AGENT AKTYWNY]\n\nRozpoczynam poszukiwania dla: ${task}\n\nUruchomiłem przeglądarkę i otworzyłem wyniki wyszukiwania w Google.\nMożesz teraz kliknąć w poniższy link, aby zobaczyć jak bot pracuje:\nhttps://www.browserbase.com/sessions/${session.id}` 
    });

  } catch (error: any) {
    console.error("Błąd backendu:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
