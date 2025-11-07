import { NextResponse } from 'next/server'

// Hardcoded admin credentials
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'PGVlasta'

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Zadejte uživatelské jméno a heslo' },
        { status: 400 }
      )
    }

    // Check against hardcoded credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Nesprávné přihlašovací údaje' },
        { status: 401 }
      )
    }

    return NextResponse.json({ 
      success: true,
      admin: {
        id: 1,
        username: username
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
