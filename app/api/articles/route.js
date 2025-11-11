import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        sections: {
          include: {
            images: true
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    // dodatečné řazení obrázků (protože Prisma to neumí v include)
    const sorted = articles.map(a => ({
      ...a,
      sections: a.sections.map(s => ({
        ...s,
        images: s.images.sort((a, b) => a.order - b.order)
      }))
    }))

    return NextResponse.json(sorted)
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
    const { title, content, excerpt, imageUrl, sections } = await request.json()

    if (!title) {
      return NextResponse.json(
          { error: 'Vyplňte název článku' },
          { status: 400 }
      )
    }

    const article = await prisma.article.create({
      data: {
        title,
        content: content || '',
        excerpt,
        imageUrl,
        sections: sections
            ? {
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
            }
            : undefined
      },
      include: {
        sections: {
          include: {
            images: true
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    // dodatečné řazení obrázků
    article.sections = article.sections.map(s => ({
      ...s,
      images: s.images.sort((a, b) => a.order - b.order)
    }))

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
        { error: 'Chyba při vytváření článku' },
        { status: 500 }
    )
  }
}
