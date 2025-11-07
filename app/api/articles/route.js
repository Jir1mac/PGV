import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(articles)
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání článků' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { title, content, excerpt, imageUrl } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Vyplňte název a obsah článku' },
        { status: 400 }
      )
    }

    const article = await prisma.article.create({
      data: { title, content, excerpt, imageUrl }
    })

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { error: 'Chyba při vytváření článku' },
      { status: 500 }
    )
  }
}
