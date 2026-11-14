import { connection, NextResponse } from 'next/server';

const STATE_KEY = 'lapatrona_pos_cloud_state_v2';

function getKvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/+$/, ''), token };
}

function parseStoredState(raw: unknown): unknown {
  let value = raw;
  for (let i = 0; i < 2 && typeof value === 'string'; i++) {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value && typeof value === 'object' ? value : null;
}

export async function GET() {
  await connection();
  const kv = getKvConfig();
  if (!kv) {
    return NextResponse.json({ cloudEnabled: false, data: null });
  }

  try {
    const res = await fetch(`${kv.url}/get/${STATE_KEY}`, {
      headers: { Authorization: `Bearer ${kv.token}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json({ cloudEnabled: true, data: null });
    }
    const json = await res.json();
    const parsed = json?.result ? parseStoredState(json.result) : null;
    return NextResponse.json({ cloudEnabled: true, data: parsed });
  } catch (error) {
    console.error('Error reading from Vercel KV:', error);
    return NextResponse.json({ cloudEnabled: false, data: null }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const kv = getKvConfig();
  if (!kv) {
    return NextResponse.json({ cloudEnabled: false, saved: false });
  }

  try {
    const body = await request.json();
    const res = await fetch(kv.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kv.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['SET', STATE_KEY, JSON.stringify(body)]),
    });
    const json = await res.json().catch(() => null);
    const saved = res.ok && !json?.error;

    if (!saved) {
      console.error('Upstash Redis SET error:', res.status, json?.error);
    }

    return NextResponse.json({ cloudEnabled: true, saved }, { status: saved ? 200 : 502 });
  } catch (error) {
    console.error('Error writing to Vercel KV:', error);
    return NextResponse.json({ cloudEnabled: true, saved: false }, { status: 500 });
  }
}