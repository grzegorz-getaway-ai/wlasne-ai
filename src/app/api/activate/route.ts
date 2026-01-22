import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Browserbase } from '@browserbasehq/sdk';
import puppeteer from 'puppeteer-core';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });

export async function POST(req: Request) {
  try {
    const { task } = await req.json();
    
    // 1. OpenAI znajduje konkretny adres URL dla zadania
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Jesteś nawigatorem wlasne.ai. Znajdź najbardziej prawdopodobny adres URL dla prośby użytkownika. Odpowiedz TYLKO samym adresem URL." },
        { role: "user", content: task }
      ],
    });

    const targetUrl = completion.choices[0].message?.content || "https://google.com";

    // 2. Tworzymy sesję w Browserbase
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
    });

    // 3. Łączymy się z przeglądarką i każemy jej wejść na stronę
    // To sprawi, że w "Live View" zobaczysz wczytywanie strony
    const browser = await puppeteer.connect({
      browserWSEndpoint: session.connectUrl,
    });

    const page = await browser.newPage();
    
    // Wysyłamy bota na stronę (nie czekamy na pełne załadowanie, żeby Vercel nie przerwał połączenia)
    page.goto(targetUrl).catch(() => {}); 

    return NextResponse.json({ 
      success: true, 
      plan: `[AGENT AKTYWNY]\n\nCel: Przejście do ${targetUrl}\n\nUruchomiłem przeglądarkę i wysłałem Agenta pod wskazany adres.\nMożesz teraz kliknąć w poniższy link, aby zobaczyć jak bot pracuje:\nhttps://www.browserbase.com/sessions/${session.id}` 
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
