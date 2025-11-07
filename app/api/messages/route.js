import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200
    })
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání vzkazů' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { name, message } = await request.json()

    if (!name || !message) {
      return NextResponse.json(
        { error: 'Vyplňte jméno a vzkaz' },
        { status: 400 }
      )
    }

    const newMessage = await prisma.message.create({
      data: { 
        name: name.slice(0, 80),
        message: message.slice(0, 2000)
      }
    })

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Chyba při vytváření vzkazu' },
      { status: 500 }
    )
  }
}
