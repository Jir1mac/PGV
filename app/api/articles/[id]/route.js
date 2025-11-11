import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Neplatné ID článku' },
        { status: 400 }
      )
    }
    
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            images: {
              orderBy: {
                order: 'asc'
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Článek nenalezen' },
        { status: 404 }
      )
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání článku' },
      { status: 500 }
    )
  }
}

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
    
    const { title, content, excerpt, imageUrl, sections } = await request.json()

    // Delete existing sections if new sections are provided
    if (sections) {
      await prisma.articleSection.deleteMany({
        where: { articleId: id }
      })
    }

    const article = await prisma.article.update({
      where: { id },
      data: { 
        title, 
        content: content || '', 
        excerpt, 
        imageUrl,
        sections: sections ? {
          create: sections.map((section, index) => ({
            text: section.text,
            order: index,
            images: {
              create: section.images.map((img, imgIndex) => ({
                imageUrl: img.imageUrl,
                order: imgIndex
              }))
            }
          }))
        } : undefined
      },
      include: {
        sections: {
          include: {
            images: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
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
