import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Browserbase } from '@browserbasehq/sdk';
import puppeteer from 'puppeteer-core';

// Ustawiamy najpotężniejszy dostępny model: GPT-5.1
const MODEL_NAME = "gpt-5.1"; 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });

export async function POST(req: Request) {
  try {
    const { task } = await req.json();
    
    // 1. GPT-5.1 analizuje zadanie i tworzy strategię wyszukiwania
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { 
          role: "system", 
          content: "Jesteś mózgiem wlasne.ai opartym na architekturze GPT-5.1. Twoim zadaniem jest przekształcenie prośby użytkownika w precyzyjny URL wyszukiwania Google, który pozwoli agentowi przeglądarkowemu znaleźć rozwiązanie. Odpowiedz TYLKO linkiem URL." 
        },
        { role: "user", content: `Zadanie: ${task}` }
      ]
    });

    const targetUrl = completion.choices[0].message?.content?.trim() || "https://www.google.com";

    // 2. Inicjalizacja sesji w Browserbase
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
    });

    // 3. Połączenie z sesją przez Puppeteer
    const browser = await puppeteer.connect({
      browserWSEndpoint: session.connectUrl,
    });

    const page = await browser.newPage();
    
    // Ustawiamy User-Agent, żeby bot wyglądał jak prawdziwy człowiek na Macu
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Nawigacja do URL wygenerowanego przez GPT-5.1
    // Nie czekamy na pełne załadowanie (networkidle), żeby uniknąć timeoutu na Vercel
    page.goto(targetUrl, { waitUntil: 'domcontentloaded' }).catch(() => {}); 

    return NextResponse.json({ 
      success: true, 
      plan: `[SYSTEM GPT-5.1 AKTYWNY]\n\nUruchomiono sesję dla zadania: ${task}\nWygenerowany URL: ${targetUrl}\n\nAgent właśnie wszedł do sieci. Możesz śledzić jego ruchy na żywo pod tym adresem:\nhttps://www.browserbase.com/sessions/${session.id}` 
    });

  } catch (error: any) {
    console.error("Błąd krytyczny:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
