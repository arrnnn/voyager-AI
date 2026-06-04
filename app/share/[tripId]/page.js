import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { MapPin, Clock, Users, DollarSign } from 'lucide-react';

export default async function SharePage({ params }) {
  const trip = await db.trip.findUnique({ where: { id: params.tripId } });

  if (!trip) return notFound();

  const itinerary = JSON.parse(trip.itinerary || '[]');
  const budget = JSON.parse(trip.budget_breakdown || '{}');
  const hotels = JSON.parse(trip.hotels || '[]');
  const tips = JSON.parse(trip.tips || '[]');

  return (
    <div className="min-h-screen bg-zinc-950 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-4">
            Shared Trip Plan by Voyager AI
          </div>
          <h1 className="text-4xl font-bold text-white capitalize mb-3">
            {trip.destination}
          </h1>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-zinc-400">
            <span className="flex items-center gap-1"><Clock size={14} />{trip.duration} days</span>
            <span className="flex items-center gap-1"><DollarSign size={14} />${trip.budget} / Rs.{(trip.budget * 83).toLocaleString('en-IN')}</span>
            <span className="flex items-center gap-1"><Users size={14} />{trip.travellers} traveller(s)</span>
            <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded-full capitalize">{trip.tripType}</span>
          </div>
        </div>

        {/* Budget */}
        {Object.keys(budget).length > 0 && (
          <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-green-400" /> Budget Breakdown
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(budget).map(([key, val]) => (
                <div key={key} className="bg-zinc-800 rounded-xl p-3 text-center">
                  <p className="text-xs text-zinc-500 capitalize mb-1">{key}</p>
                  <p className="text-lg font-bold text-green-400">${val}</p>
                  <p className="text-xs text-zinc-600">Rs.{(val * 83).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itinerary */}
        {itinerary.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock size={18} className="text-blue-400" /> Day-by-Day Itinerary
            </h2>
            <div className="space-y-4">
              {itinerary.map((day, i) => (
                <div key={i} className="border border-zinc-700/50 rounded-xl overflow-hidden">
                  <div className="bg-zinc-800 px-4 py-3 flex items-center gap-3">
                    <span className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {day.day}
                    </span>
                    <div>
                      <p className="font-semibold text-white text-sm">{day.title}</p>
                      {day.theme && <p className="text-xs text-blue-400">{day.theme}</p>}
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {Array.isArray(day.activities) && day.activities.map((act, j) => {
                      const isObj = typeof act === 'object' && act !== null;
                      return (
                        <div key={j} className="flex gap-3 bg-zinc-800/50 rounded-lg p-3">
                          {isObj && act.time && (
                            <span className="text-xs text-blue-400 font-semibold min-w-[60px]">{act.time}</span>
                          )}
                          <div>
                            {isObj ? (
                              <>
                                <p className="text-white text-sm font-medium">{act.place}</p>
                                {act.description && <p className="text-zinc-400 text-xs mt-1">{act.description}</p>}
                                {act.cost && <p className="text-green-400 text-xs mt-1">{act.cost}</p>}
                              </>
                            ) : (
                              <p className="text-zinc-300 text-sm">{act}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {(day.breakfast || day.lunch || day.dinner) && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {[
                          { label: 'Breakfast', data: day.breakfast, color: 'text-yellow-400' },
                          { label: 'Lunch', data: day.lunch, color: 'text-orange-400' },
                          { label: 'Dinner', data: day.dinner, color: 'text-red-400' },
                        ].map(({ label, data, color }) => data && (
                          <div key={label} className="bg-zinc-800 rounded-lg p-2">
                            <p className={`text-xs font-semibold ${color}`}>{label}</p>
                            <p className="text-white text-xs">{data.place}</p>
                            <p className="text-zinc-500 text-xs">{data.dish}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hotels */}
        {hotels.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Recommended Hotels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {hotels.map((hotel, i) => (
                <div key={i} className="bg-zinc-800 rounded-xl p-4">
                  <p className="font-medium text-white text-sm">{hotel.name}</p>
                  <p className="text-green-400 text-sm">${hotel.price}/night</p>
                  <p className="text-zinc-400 text-xs mt-1">{hotel.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {tips.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Travel Tips</h2>
            <div className="space-y-2">
              {tips.map((tip, i) => (
                <div key={i} className="flex gap-3 text-sm text-zinc-300 bg-zinc-800 rounded-lg p-3">
                  <span className="text-yellow-400 font-bold">{i + 1}.</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-8 p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-2xl">
          <p className="text-white font-semibold mb-2">Plan your own trip with Voyager AI</p>
          <p className="text-zinc-400 text-sm mb-4">Get personalized itineraries, budget plans, and more</p>
          
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition text-sm"
          >
            Try Voyager AI Free
          </a>
        </div>

      </div>
    </div>
  );
}