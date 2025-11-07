import { NextResponse } from 'next/server';
import { getAdminByUsername, verifyPassword, signToken } from '../../../../lib/auth.js';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { username, password } = body || {};
    if (!username || !password) return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });

    const admin = await getAdminByUsername(username);
    if (!admin) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const ok = await verifyPassword(password, admin.passwordHash);
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = signToken({ id: admin.id, username: admin.username });
    return NextResponse.json({ token }, { status: 200 });
  } catch (e) {
    console.error('POST /api/admin/login error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}