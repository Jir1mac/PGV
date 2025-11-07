import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma.js';
import { verifyToken } from '../../../../../lib/auth.js';

function requireAdmin(request) {
  const auth = request.headers.get('authorization') || '';
  const m = auth.match(/^Bearer (.+)$/);
  if (!m) throw new Error('Unauthorized');
  verifyToken(m[1]);
}

export async function PUT(request, { params }) {
  try {
    requireAdmin(request);
    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { title, url } = body || {};
    if (!title || !url) return NextResponse.json({ error: 'Missing title or url' }, { status: 400 });

    const updated = await prisma.video.update({ where: { id: Number(id) }, data: { title, url } });
    return NextResponse.json(updated, { status: 200 });
  } catch (e) {
    console.error(e);
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    requireAdmin(request);
    const { id } = params;
    await prisma.video.delete({ where: { id: Number(id) } });
    return NextResponse.json({ status: 'deleted' }, { status: 200 });
  } catch (e) {
    console.error(e);
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}