const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const config = await prisma.videoAPIConfig.findFirst({
    where: { id: 'default_config' }
  });
  console.log('数据库中的配置:', JSON.stringify(config, null, 2));
  await prisma.$disconnect();
}

check();

