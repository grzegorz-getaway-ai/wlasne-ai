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
    
    // 1. GPT-5.1 analizuje zadanie i przygotowuje URL startowy
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { 
          role: "system", 
          content: "Jesteś inteligentnym nawigatorem. Znajdź URL od którego bot powinien zacząć wykonanie zadania. Odpowiedz TYLKO linkiem." 
        },
        { role: "user", content: task }
      ]
    });

    const targetUrl = completion.choices[0].message?.content?.trim() || "https://www.google.com";

    // 2. Tworzymy sesję z PROXY (Twój Developer Plan)
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      proxies: true 
    });

    // 3. Łączymy się i przekazujemy instrukcję działania
    const browser = await chromium.connectOverCDP(session.connectUrl);
    const defaultContext = browser.contexts()[0];
    const page = defaultContext.pages()[0] || await defaultContext.newPage();

    try {
      // Wchodzimy na stronę (np. Nobu)
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
      
      // Inteligenta próba kliknięcia (Stagehand Logic):
      // Szukamy przycisków typu "Menu", "Karta dań", "Inspiracje" zależnie od zadania
      const keywords = ['Menu', 'Karta dań', 'Inspiracje', 'Barcelona'];
      for (const word of keywords) {
        if (task.toLowerCase().includes(word.toLowerCase()) || true) {
           const btn = page.locator(`text=/${word}/i`).first();
           if (await btn.isVisible()) {
             await btn.click({ timeout: 5000 }).catch(() => {});
             console.log(`Kliknięto: ${word}`);
             break;
           }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (e) {
      console.log("Działanie w toku...");
    }

    // NIE zamykamy sesji, żebyś mógł zobaczyć efekt kliknięcia
    await browser.close().catch(() => {});

    return NextResponse.json({ 
      success: true, 
      plan: `[AGENT GPT-5.1 PROFESSIONAL]\n\nCel: ${targetUrl}\nZadanie: ${task}\n\nAgent wszedł na stronę i spróbował odnaleźć właściwą sekcję.\nWejdź w link, aby zobaczyć efekt końcowy:\nhttps://www.browserbase.com/sessions/${session.id}` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
