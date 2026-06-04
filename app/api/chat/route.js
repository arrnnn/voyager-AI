import { auth } from '@clerk/nextjs/server';
import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { message, tripContext, history } = await req.json();

    const systemPrompt = `You are a helpful travel assistant for a trip to ${tripContext.destination}.
Here is the user's trip plan:
- Destination: ${tripContext.destination}
- Duration: ${tripContext.duration} days
- Budget: $${tripContext.budget}
- Travellers: ${tripContext.travellers}
- Trip Type: ${tripContext.tripType}
- Itinerary: ${JSON.stringify(tripContext.itinerary)}
- Hotels: ${JSON.stringify(tripContext.hotels)}
- Attractions: ${JSON.stringify(tripContext.attractions)}
- Budget Breakdown: ${JSON.stringify(tripContext.budget_breakdown)}
- Tips: ${JSON.stringify(tripContext.tips)}

Answer questions about this specific trip plan. Be concise, helpful, and friendly.
If asked about things outside this trip, gently redirect to the trip context.`;

    const chatHistory = history
      .slice(-6)
      .map(m => ({ role: m.role, content: m.content }));

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      messages: [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
        { role: 'user', content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not answer that.';
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('[CHAT_ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}