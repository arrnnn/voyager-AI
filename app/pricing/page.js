import Link from 'next/link';
import { Check, Zap } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/10 border border-green-500/20 rounded-full text-green-400 text-sm mb-6">
          <Zap size={14} />
          All features are completely free
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">Free Forever</h1>
        <p className="text-xl text-zinc-400 mb-12">
          All features are available for free. No payment required.
        </p>

        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-8 text-left mb-8">
          <div className="text-center mb-6">
            <p className="text-5xl font-bold text-white">Rs.0</p>
            <p className="text-zinc-400 mt-1">Forever free</p>
          </div>

          <ul className="space-y-3">
            {[
              'Unlimited trip generations',
              'Day-by-day itinerary with real places',
              'Budget breakdown in USD and INR',
              'Hotel suggestions',
              'Top attractions',
              'Flight information',
              'Visa and currency guide',
              'Packing list',
              'Export as HTML',
              'Save unlimited trips',
              'Share trip link',
              'AI Trip Assistant chat',
              'Return journey tips',
              'Emergency contacts',
            ].map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-zinc-200">
                <Check size={16} className="text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <Link
            href="/sign-up"
            className="block w-full text-center py-3.5 mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl transition text-sm"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}