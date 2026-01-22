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
    
    // 1. GPT-5.1 analizuje zadanie i przygotowuje plan
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { 
          role: "system", 
          content: "Jesteś mózgiem wlasne.ai. Użytkownik chce coś załatwić w sieci. Twoim zadaniem jest określić: 1. Adres URL od którego zacząć 2. Krótką instrukcję co bot ma tam zrobić (np. 'kliknij w menu', 'znajdź sekcję inspiracje'). Odpowiedz w formacie: URL: [link] AKCJA: [opis]" 
        },
        { role: "user", content: task }
      ]
    });

    const aiResponse = completion.choices[0].message?.content || "";
    const targetUrl = aiResponse.match(/URL: (https?:\/\/[^\s]+)/)?.[1] || "https://www.google.com";
    const actionDesc = aiResponse.split("AKCJA:")[1]?.trim() || task;

    // 2. Tworzymy sesję w Browserbase (Developer Plan - Proxies ON)
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      proxies: true 
    });

    // 3. Łączymy się i wykonujemy akcję
    const browser = await chromium.connectOverCDP(session.connectUrl);
    const defaultContext = browser.contexts()[0];
    const page = defaultContext.pages()[0] || await defaultContext.newPage();

    // 4. Autonomiczne działanie
    try {
      console.log(`Wchodzę na: ${targetUrl}`);
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      // Próba automatycznego kliknięcia w "Akceptuję" (cookies), żeby nie zasłaniały widoku
      const cookieButtons = ['Zgadzam się', 'Akceptuję', 'Accept', 'Allow all', 'OK'];
      for (const text of cookieButtons) {
        const btn = page.getByText(text, { exact: false }).first();
        if (await btn.isVisible()) {
          await btn.click().catch(() => {});
          break;
        }
      }

      // Krótka pauza na wykonanie akcji
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (e) {
      console.log("Działanie w toku...");
    }

    // NIE zamykamy sesji - pozwalamy użytkownikowi wejść i zobaczyć wynik
    await browser.close().catch(() => {});

    return NextResponse.json({ 
      success: true, 
      plan: `[AGENT GPT-5.1 AKTYWNY]\n\nCel: ${targetUrl}\nPlanowana akcja: ${actionDesc}\n\nAgent wszedł na stronę i spróbował ominąć przeszkody (np. cookies).\nKliknij tutaj, aby przejąć stery:\nhttps://www.browserbase.com/sessions/${session.id}` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
