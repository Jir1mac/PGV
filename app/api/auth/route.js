import { NextResponse } from 'next/server'

// Hardcoded admin credentials
// NOTE: For production use, consider moving these to environment variables
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'PGVlasta'

// Constant-time string comparison to prevent timing attacks
function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false
  }
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Zadejte uživatelské jméno a heslo' },
        { status: 400 }
      )
    }

    // Check against hardcoded credentials using constant-time comparison
    const usernameValid = timingSafeEqual(username, ADMIN_USERNAME)
    const passwordValid = timingSafeEqual(password, ADMIN_PASSWORD)

    if (!usernameValid || !passwordValid) {
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
