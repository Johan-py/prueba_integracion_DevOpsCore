import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

// Cargar .env de forma robusta para Bun/Node
dotenv.config({ path: path.join((import.meta as any).dir, '../.env') })

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL no encontrada para el seeding')
}

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create Example User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@social-is.com' },
    update: {},
    create: {
      username: 'arquitecto_is',
      email: 'admin@social-is.com',
      password: 'esto_es_un_secreto', // En un caso real usaría hash
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    }
  })

  console.log(`✅ User created: ${admin.username}`)

  // 2. Create Example Post
  const examplePost = await prisma.post.create({
    data: {
      content:
        '🚀 ¡Hola, mundo IS! Esta es la primera publicación de ejemplo usando Screaming Architecture y Bun. ¡A darle con todo, equipo! 💻🔥',
      imageUrl:
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
      authorId: admin.id
    }
  })

  console.log(`✅ Example post created by ${admin.username}`)

  // 3. Create a Comment (Optional)
  await prisma.comment.create({
    data: {
      content: '¡Excelente arquitectura! Se ve muy limpio.',
      authorId: admin.id,
      postId: examplePost.id
    }
  })

  console.log('🏁 Seeding finished successfully.')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
