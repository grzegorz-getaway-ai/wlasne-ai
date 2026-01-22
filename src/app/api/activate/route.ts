import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Browserbase } from '@browserbasehq/sdk';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });

export async function POST(req: Request) {
  try {
    const { task } = await req.json();
    
    // 1. Tworzymy sesję przeglądarki w chmurze
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
    });

    // 2. OpenAI tworzy plan nawigacji (co bot ma wpisać i gdzie kliknąć)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Jesteś nawigatorem wlasne.ai. Użytkownik chce coś załatwić. Napisz bardzo krótką instrukcję: jaki adres URL odwiedzić i czego tam szukać." },
        { role: "user", content: task }
      ],
    });

    const instruction = completion.choices[0].message?.content;

    // 3. Zwracamy status i link do "Live View", żebyś mógł zobaczyć co robi bot
    return NextResponse.json({ 
      success: true, 
      plan: `[SESJA AKTYWNA]\n\nCel: ${instruction}\n\nTwój Agent właśnie otworzył przeglądarkę w chmurze.\nMożesz śledzić jego pracę tutaj: https://www.browserbase.com/sessions/${session.id}` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
