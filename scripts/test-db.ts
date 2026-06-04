import { config } from "dotenv";

config();

const { prisma } = await import("@/lib/prisma");

async function main() {
  const userCount = await prisma.user.count();
  const itemCount = await prisma.item.count();
  const collectionCount = await prisma.collection.count();

  console.log("Database connection OK");
  console.log(`Users: ${userCount}`);
  console.log(`Items: ${itemCount}`);
  console.log(`Collections: ${collectionCount}`);
}

main()
  .catch((error: unknown) => {
    console.error("Database test failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
