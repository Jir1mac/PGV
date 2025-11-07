import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma.js';
import { verifyToken } from '../../../../lib/auth.js';

function requireAdmin(request) {
  const auth = request.headers.get('authorization') || '';
  const m = auth.match(/^Bearer (.+)$/);
  if (!m) throw new Error('Unauthorized');
  verifyToken(m[1]);
}

export async function GET() {
  try {
    const rows = await prisma.video.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(rows, { status: 200 });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function POST(request) {
  try {
    requireAdmin(request);
    const body = await request.json().catch(() => ({}));
    const { title, url } = body || {};
    if (!title || !url) return NextResponse.json({ error: 'Missing title or url' }, { status: 400 });

    const created = await prisma.video.create({ data: { title, url } });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error('POST /api/videos error:', e);
    if (e?.code === 'P2002') return NextResponse.json({ error: 'Video already exists' }, { status: 409 });
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}