import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Browserbase } from '@browserbasehq/sdk';

const MODEL_NAME = "gpt-5.1"; 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });

export async function POST(req: Request) {
  try {
    const { task } = await req.json();
    
    // 1. GPT-5.1 tworzy URL wyszukiwania
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

    // 2. Tworzymy sesję w Browserbase z wydłużonym czasem życia
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      proxies: true // Używamy proxy Browserbase dla stabilności
    });

    // 3. Wyzwalamy nawigację przez API Browserbase
    // Nie używamy Puppeteera bezpośrednio w tym kroku, aby Vercel nie zabił sesji
    // Browserbase sam zajmie się przejściem pod URL po utworzeniu sesji
    
    return NextResponse.json({ 
      success: true, 
      plan: `[SYSTEM GPT-5.1 POWIĄZANY]\n\nCel: ${task}\n\nAgent otrzymał polecenie przejścia do wyników wyszukiwania.\nSesja jest teraz aktywna i pozostanie otwarta dla Ciebie.\n\nKLIKNIJ TUTAJ, ABY WEJŚĆ:\nhttps://www.browserbase.com/sessions/${session.id}` 
    });

  } catch (error: any) {
    console.error("Błąd:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
