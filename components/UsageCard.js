export default function UsageCard({ used }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-white text-sm">Today's Usage</h3>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-500/15 text-green-400">
          Unlimited
        </span>
      </div>
      <div className="text-center py-2">
        <p className="text-2xl font-bold text-white">{used}</p>
        <p className="text-xs text-zinc-400 mt-1">generations today</p>
      </div>
    </div>
  );
}