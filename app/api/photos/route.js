import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get('destination');

  if (!destination) {
    return NextResponse.json({ photos: [] });
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(destination)},travel&per_page=3&orientation=landscape&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
    );
    const data = await res.json();
    const photos = data.results?.map(p => p.urls.regular) || [];
    return NextResponse.json({ photos });
  } catch (error) {
    return NextResponse.json({ photos: [] });
  }
}