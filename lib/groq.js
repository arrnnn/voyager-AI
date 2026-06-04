import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const tripTypeContext = {
  normal: 'mix of popular landmarks and local experiences suitable for all',
  family: 'family-friendly, kid-safe, educational activities with easy walking distances',
  couples: 'romantic dinners, sunset views, couples spa, scenic walks, intimate experiences',
  bachelors: 'nightlife, adventure sports, street food, group activities, party spots',
  solo: 'safe solo-friendly activities, budget tips, hostels, easy navigation',
  business: 'business district hotels, quick sightseeing, meeting-friendly cafes',
};

function safeJSONParse(str) {
  try {
    let clean = str
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
      .replace(/,(\s*[}\]])/g, '$1');
    return JSON.parse(clean);
  } catch (e) {
    return null;
  }
}

async function callGroq(prompt, maxTokens = 3000) {
 const models = [
  'llama-3.1-8b-instant',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'llama-3.3-70b-versatile',
];


  for (const model of models) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      });
      return completion.choices[0]?.message?.content || '';
    } catch (err) {
      if (err?.status === 429 || err?.message?.includes('rate_limit')) {
        await new Promise(r => setTimeout(r, 500));
        continue;
      }
      throw err;
    }
  }
  throw new Error('All models rate limited. Please try again.');
}

async function generateDaysChunk(dayNums, destination, tripType, travellers, perDayUSD, perDayINR, origin) {
  const context = tripTypeContext[tripType] || tripTypeContext.normal;

  const daysJson = dayNums.map(d => `{
    "day": ${d},
    "title": "Day ${d} title for ${destination}",
    "theme": "Theme for ${tripType}",
    "dayHighlight": "Best experience of day ${d}",
    "activities": [
      { "time": "9:00 AM", "place": "Real place in ${destination}", "description": "What this is and why special for ${tripType}.", "duration": "2 hours", "cost": "$10 / Rs.830", "tips": "Tip" },
      { "time": "12:00 PM", "place": "Real place in ${destination}", "description": "What this is and why special for ${tripType}.", "duration": "1.5 hours", "cost": "$5 / Rs.415", "tips": "Tip" },
      { "time": "3:00 PM", "place": "Real place in ${destination}", "description": "What this is and why special for ${tripType}.", "duration": "2 hours", "cost": "$15 / Rs.1245", "tips": "Tip" },
      { "time": "7:00 PM", "place": "Real place in ${destination}", "description": "What this is and why special for ${tripType}.", "duration": "2 hours", "cost": "$20 / Rs.1660", "tips": "Tip" }
    ],
    "breakfast": { "place": "Real cafe", "dish": "Dish", "cost": "$8 / Rs.664" },
    "lunch": { "place": "Real restaurant", "dish": "Dish", "cost": "$12 / Rs.996" },
    "dinner": { "place": "Real restaurant", "dish": "Dish", "cost": "$18 / Rs.1494" },
    "accommodation": "Real hotel - why good for ${tripType}",
    "transport": "Transport and cost",
    "dailyTotal": "$${perDayUSD} / Rs.${perDayINR.toLocaleString('en-IN')}"
  }`).join(',\n');

  const prompt = `Travel expert. Generate days ${dayNums[0]}-${dayNums[dayNums.length - 1]} for ${tripType} trip to ${destination} for ${travellers} travellers from ${origin || 'India'}.
Focus: ${context}. Budget: $${perDayUSD}/day.

Return ONLY a JSON array with EXACTLY ${dayNums.length} objects. No text outside JSON:

[${daysJson}]

Use REAL place names in ${destination}. Make each day unique.`;

  const text = await callGroq(prompt, 3000);
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  return safeJSONParse(match[0]) || [];
}

async function generateMeta(destination, tripType, travellers, budget, perDayUSD, perDayINR, origin) {
  const prompt = `You are a travel expert. Generate real specific travel info for a ${tripType} trip from ${origin || 'India'} to ${destination} for ${travellers} travellers. Budget: $${budget}.

Return ONLY valid JSON. Use REAL dish names, restaurant names, and hotel names specific to ${destination}:

{
  "hotels": [
    { "name": "Real hotel name in ${destination}", "area": "Specific neighborhood - why ideal for ${tripType}", "price": ${Math.round(perDayUSD * 0.4)}, "priceINR": ${Math.round(perDayUSD * 0.4 * 83)}, "rating": 4.5, "description": "Why perfect for ${tripType} travellers in ${destination}" },
    { "name": "Second real hotel in ${destination}", "area": "Specific neighborhood", "price": ${Math.round(perDayUSD * 0.3)}, "priceINR": ${Math.round(perDayUSD * 0.3 * 83)}, "rating": 4.0, "description": "Why perfect for ${tripType} travellers" }
  ],
  "attractions": [
    { "name": "Real famous attraction in ${destination}", "distance": "Xkm from city center", "entry_fee": "$X / Rs.X or Free", "best_time": "Morning or Evening", "duration": "X hours", "tips": "Specific insider tip" },
    { "name": "Second real attraction in ${destination}", "distance": "Xkm", "entry_fee": "Free", "best_time": "Afternoon", "duration": "1.5 hours", "tips": "Specific insider tip" },
    { "name": "Third real attraction in ${destination}", "distance": "Xkm", "entry_fee": "$X / Rs.X", "best_time": "Morning", "duration": "2 hours", "tips": "Specific insider tip" }
  ],
  "local_transport": {
    "options": ["Specific transport 1", "Specific transport 2", "Specific transport 3"],
    "estimatedDailyCostUSD": 15,
    "estimatedDailyCostINR": 1245,
    "tips": "Specific transport advice for ${destination}"
  },
  "food_guide": {
    "mustTry": [
      "Real local dish 1 of ${destination}",
      "Real local dish 2 of ${destination}",
      "Real local dish 3 of ${destination}",
      "Real local dish 4 of ${destination}"
    ],
    "avgMealCostUSD": ${Math.round(perDayUSD * 0.15)},
    "avgMealCostINR": ${Math.round(perDayUSD * 0.15 * 83)},
    "restaurants": [
      "Real famous restaurant name in ${destination}",
      "Real second restaurant in ${destination}",
      "Best street food area in ${destination}"
    ]
  },
  "packingList": {
    "essentials": ["Passport", "Travel insurance documents", "Visa printout", "Emergency cash in local currency", "Medicines"],
    "clothing": ["Real clothing item for ${destination} weather 1", "Real clothing item 2", "Real clothing item 3", "Comfortable walking shoes", "Rain jacket if needed"],
    "toiletries": ["Sunscreen SPF 50", "Insect repellent", "Hand sanitizer", "Basic first aid kit"],
    "electronics": ["Universal travel adapter", "Portable power bank", "Camera", "Earphones"],
    "tripSpecific": ["Item specific to ${tripType} trip 1", "Item specific to ${destination} 2", "Item specific to ${tripType} 3"]
  },
  "returnJourney": {
    "tips": "Specific advice for return journey from ${destination} to ${origin || 'India'}",
    "checkoutTime": "Standard hotel checkout time in ${destination}",
    "airportTransfer": "Best way to get to airport from ${destination} city center with cost",
    "airportArrival": "How early to arrive at ${destination} airport",
    "dutyFree": "Best duty free items to buy at ${destination} airport",
    "customsTips": "What to declare when returning to India from ${destination}"
  },
  "tips": [
    "Specific tip 1 for ${tripType} travellers in ${destination}",
    "Specific safety tip for ${destination}",
    "Money saving tip specific to ${destination}",
    "Local etiquette tip for ${destination}",
    "Hidden gem tip in ${destination}"
  ],
  "flights": {
    "from": "${origin || 'India'}",
    "to": "${destination}",
    "estimatedCostUSD": ${Math.round(budget * 0.25)},
    "estimatedCostINR": ${Math.round(budget * 0.25 * 83)},
    "tips": "Book 2-3 months in advance for best prices on ${origin || 'India'} to ${destination} route",
    "airlines": ["Air India", "IndiGo", "Emirates"]
  },
  "bestTimeToVisit": "Best months to visit ${destination} and why",
  "visa": "Visa requirements for Indian passport holders visiting ${destination}",
  "currency": "Local currency name, current approximate exchange rate from INR",
  "emergency": "Emergency number in ${destination} and Indian embassy contact"
}`;

  const text = await callGroq(prompt, 2000);
  const match = text.match(/\{[\s\S]*\}/);
  return match ? (safeJSONParse(match[0]) || {}) : {};
}

export async function generateTravelPlan(destination, budget, duration, travellers, tripType, origin) {
  const budgetINR = budget * 83;
  const perDayUSD = Math.round(budget / duration);
  const perDayINR = perDayUSD * 83;

  // Split into chunks of 3 days
  const allDays = Array.from({ length: duration }, (_, i) => i + 1);
  const chunks = [];
  for (let i = 0; i < allDays.length; i += 3) {
    chunks.push(allDays.slice(i, i + 3));
  }

  // Run itinerary chunks + meta in parallel
  const [metaResult, ...chunkResults] = await Promise.all([
    generateMeta(destination, tripType, travellers, budget, perDayUSD, perDayINR, origin),
    ...chunks.map((chunk, idx) =>
      new Promise(resolve =>
        setTimeout(
          () => generateDaysChunk(chunk, destination, tripType, travellers, perDayUSD, perDayINR, origin).then(resolve).catch(() => resolve([])),
          idx * 200
        )
      )
    ),
  ]);

  const meta = metaResult || {};
  const itinerary = chunkResults
    .flat()
    .filter(Boolean)
    .sort((a, b) => a.day - b.day);

  return {
    origin: origin || 'India',
    destination,
    budgetUSD: budget,
    budgetINR,
    tripType,
    travellers,
    totalDays: duration,
    itinerary,
    budget_breakdown: {
      flights: Math.round(budget * 0.25),
      accommodation: Math.round(budget * 0.30),
      food: Math.round(budget * 0.20),
      activities: Math.round(budget * 0.10),
      transport: Math.round(budget * 0.08),
      shopping: Math.round(budget * 0.05),
      misc: Math.round(budget * 0.02),
    },
    budget_breakdown_inr: {
      flights: Math.round(budget * 0.25 * 83),
      accommodation: Math.round(budget * 0.30 * 83),
      food: Math.round(budget * 0.20 * 83),
      activities: Math.round(budget * 0.10 * 83),
      transport: Math.round(budget * 0.08 * 83),
      shopping: Math.round(budget * 0.05 * 83),
      misc: Math.round(budget * 0.02 * 83),
    },
    hotels: meta.hotels || [],
    attractions: meta.attractions || [],
    local_transport: meta.local_transport || null,
    food_guide: meta.food_guide || null,
    tips: meta.tips || [],
    flights: meta.flights || null,
    bestTimeToVisit: meta.bestTimeToVisit || '',
    visa: meta.visa || '',
    currency: meta.currency || '',
    emergency: meta.emergency || '',
  };
}