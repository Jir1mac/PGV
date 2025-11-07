import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Zadejte uživatelské jméno a heslo' },
        { status: 400 }
      )
    }

    const admin = await prisma.admin.findUnique({
      where: { username }
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Nesprávné přihlašovací údaje' },
        { status: 401 }
      )
    }

    const validPassword = await bcrypt.compare(password, admin.password)

    if (!validPassword) {
      return NextResponse.json(
        { error: 'Nesprávné přihlašovací údaje' },
        { status: 401 }
      )
    }

    return NextResponse.json({ 
      success: true,
      admin: {
        id: admin.id,
        username: admin.username
      }
    })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Chyba při přihlašování' },
      { status: 500 }
    )
  }
}
