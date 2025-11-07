import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma.js';
import { hashPassword, verifyToken } from '../../../../lib/auth.js';

export async function POST(request) {
  try {
    // ensure prisma client is ready
    const body = await request.json().catch(() => ({}));
    const { username, password } = body || {};
    if (!username || !password) return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });

    const count = await prisma.admin.count();

    if (count > 0) {
      const auth = request.headers.get('authorization') || '';
      const match = auth.match(/^Bearer (.+)$/);
      if (!match) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      try { verifyToken(match[1]); } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
    }

    const password_hash = await hashPassword(password);
    const admin = await prisma.admin.create({ data: { username, passwordHash: password_hash } });
    return NextResponse.json({ status: 'OK', id: admin.id }, { status: 201 });
  } catch (e) {
    console.error('POST /api/admin/create error:', e);
    if (e?.code === 'P2002') return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}