const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('PGVlasta', 10)
  
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  })

  console.log('Admin user created:', admin.username)

  // Add some sample videos (optional)
  const video1 = await prisma.video.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Ukázkové video 1',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
  })

  console.log('Sample video created:', video1.title)

  // Add a sample article (optional)
  const article1 = await prisma.article.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Vítejte na našich stránkách',
      content: 'Toto je ukázkový článek. Můžete ho upravit nebo smazat v administraci.',
      excerpt: 'Úvodní článek s informacemi o webu.',
      imageUrl: 'https://images.unsplash.com/photo-1508833625015-6b5097f83b4a?q=80&w=800&auto=format&fit=crop',
    },
  })

  console.log('Sample article created:', article1.title)

  console.log('Database seed completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
