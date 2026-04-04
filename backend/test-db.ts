import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function test() {
  console.log("🔍 Buscando Inmueble ID 1 con su ubicación...");
  const inmueble = await prisma.inmueble.findFirst({
    where: { id: 1 },
    include: { ubicacion: true }
  });
  
  console.log("Inmueble hallado:", JSON.stringify(inmueble, null, 2));
  
  if (inmueble?.ubicacion?.ubicacionMaestraId) {
    console.log("✅ El puente existe. Buscando por locationId: 1...");
    const busqueda = await prisma.inmueble.findMany({
      where: {
        ubicacion: { ubicacionMaestraId: 1 }
      }
    });
    console.log(`📊 Resultados encontrados con ID 1: ${busqueda.length}`);
  } else {
    console.log("❌ ERROR: El inmueble 1 no tiene vinculada una ubicación maestra en la DB.");
  }
}
test();