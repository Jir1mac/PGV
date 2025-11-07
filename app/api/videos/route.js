import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(videos)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání videí' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { title, url } = await request.json()

    if (!title || !url) {
      return NextResponse.json(
        { error: 'Vyplňte název a URL videa' },
        { status: 400 }
      )
    }

    const video = await prisma.video.create({
      data: { title, url }
    })

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: 'Chyba při vytváření videa' },
      { status: 500 }
    )
  }
}
