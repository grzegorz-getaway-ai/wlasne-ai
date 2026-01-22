import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { task } = await req.json();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Jesteś Osobistym AI użytkownika. Twoim celem jest przygotowanie planu wykonania zadania. Bądź konkretny i profesjonalny." },
        { role: "user", content: `Zadanie do wykonania: ${task}` }
      ],
    });

    return NextResponse.json({ 
      success: true, 
      plan: completion.choices[0].message.content 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
