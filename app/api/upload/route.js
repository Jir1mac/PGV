import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request) {
  try {
    const data = await request.formData()
    const file = data.get('file')

    if (!file) {
      return NextResponse.json(
        { error: 'Žádný soubor nebyl nahrán' },
        { status: 400 }
      )
    }

    // Check if file is actually a File object
    if (typeof file === 'string' || !file.arrayBuffer) {
      return NextResponse.json(
        { error: 'Neplatný formát souboru' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Neplatný typ souboru (${file.type}). Povolené typy: JPG, PNG, GIF, WEBP` },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Soubor je příliš velký (${Math.round(file.size / 1024 / 1024)}MB). Maximum: 5MB` },
        { status: 400 }
      )
    }

    // Convert file to buffer
    let bytes
    try {
      bytes = await file.arrayBuffer()
    } catch (error) {
      console.error('Error reading file buffer:', error)
      return NextResponse.json(
        { error: 'Chyba při čtení souboru' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}-${originalName}`
    
    // Ensure the images directory exists
    const imagesDir = join(process.cwd(), 'public', 'images')
    try {
      await mkdir(imagesDir, { recursive: true })
    } catch (error) {
      console.error('Error creating images directory:', error)
      return NextResponse.json(
        { error: 'Chyba při vytváření adresáře pro obrázky' },
        { status: 500 }
      )
    }

    const filepath = join(imagesDir, filename)

    // Write file
    try {
      await writeFile(filepath, buffer)
    } catch (error) {
      console.error('Error writing file to disk:', error)
      return NextResponse.json(
        { error: 'Chyba při ukládání souboru na disk' },
        { status: 500 }
      )
    }

    // Return the public URL
    const imageUrl = `/images/${filename}`
    return NextResponse.json({ imageUrl }, { status: 201 })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: `Chyba při nahrávání souboru: ${error.message}` },
      { status: 500 }
    )
  }
}
