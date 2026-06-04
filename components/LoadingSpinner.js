export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-transparent border-l-transparent animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-white font-medium">Generating your trip plan...</p>
        <p className="text-zinc-500 text-sm mt-1">AI is crafting your perfect itinerary</p>
      </div>
    </div>
  );
}