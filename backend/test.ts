import { prisma } from "./src/lib/prisma.client.js";

async function main() {
  const data = await prisma.inmueble.findMany({
    take: 1,
  });

  console.log(data);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
