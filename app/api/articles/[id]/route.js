import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Neplatné ID článku' },
        { status: 400 }
      )
    }
    
    await prisma.article.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { error: 'Chyba při mazání článku' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Neplatné ID článku' },
        { status: 400 }
      )
    }
    
    const { title, content, excerpt, imageUrl } = await request.json()

    const article = await prisma.article.update({
      where: { id },
      data: { title, content, excerpt, imageUrl }
    })

    return NextResponse.json(article)
  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { error: 'Chyba při aktualizaci článku' },
      { status: 500 }
    )
  }
}
