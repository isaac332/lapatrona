import { NextResponse } from 'next/server';

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const STATE_KEY = 'lapatrona_pos_cloud_state_v2';

export async function GET(request: Request) {
  void request.url;
  if (!KV_URL || !KV_TOKEN) {
    return NextResponse.json({ cloudEnabled: false, data: null });
  }

  try {
    const res = await fetch(`${KV_URL}/get/${STATE_KEY}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json({ cloudEnabled: true, data: null });
    }
    const json = await res.json();
    const parsed = json.result ? JSON.parse(json.result) : null;
    return NextResponse.json({ cloudEnabled: true, data: parsed });
  } catch (error) {
    console.error('Error reading from Vercel KV:', error);
    return NextResponse.json({ cloudEnabled: false, data: null }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!KV_URL || !KV_TOKEN) {
    return NextResponse.json({ cloudEnabled: false, saved: false });
  }

  try {
    const body = await request.json();
    const res = await fetch(`${KV_URL}/set/${STATE_KEY}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(JSON.stringify(body)),
    });

    return NextResponse.json({ cloudEnabled: true, saved: res.ok });
  } catch (error) {
    console.error('Error writing to Vercel KV:', error);
    return NextResponse.json({ cloudEnabled: true, saved: false }, { status: 500 });
  }
}