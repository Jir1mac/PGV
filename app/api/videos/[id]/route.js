import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id)
    
    await prisma.video.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { error: 'Chyba při mazání videa' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id)
    const { title, url } = await request.json()

    const video = await prisma.video.update({
      where: { id },
      data: { title, url }
    })

    return NextResponse.json(video)
  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json(
      { error: 'Chyba při aktualizaci videa' },
      { status: 500 }
    )
  }
}
