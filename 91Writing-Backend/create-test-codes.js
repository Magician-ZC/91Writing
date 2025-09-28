// 创建测试邀请码的脚本
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestData() {
  try {
    console.log('开始创建测试数据...')
    
    // 1. 创建测试套餐
    const package1 = await prisma.package.upsert({
      where: { name: '基础套餐' },
      update: {},
      create: {
        name: '基础套餐',
        description: '基础功能套餐',
        price: 99.00,
        durationDays: 30,
        features: {
          aiGeneration: true,
          maxNovels: 5,
          maxChapters: 100
        },
        status: 'ACTIVE'
      }
    })
    
    console.log('✅ 创建套餐:', package1.name)

    // 2. 创建有效的测试邀请码
    const validCode = await prisma.activationCode.upsert({
      where: { code: 'TEST2024VALID' },
      update: {},
      create: {
        code: 'TEST2024VALID',
        packageId: package1.id,
        status: 'UNUSED',
        createdBy: 'cmg34p9m30000d2mpnlfbbag2', // 使用之前创建的用户ID
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后过期
      }
    })
    
    console.log('✅ 创建有效邀请码:', validCode.code)

    // 3. 创建已过期的测试邀请码
    const expiredCode = await prisma.activationCode.upsert({
      where: { code: 'TEST2024EXPIRED' },
      update: {},
      create: {
        code: 'TEST2024EXPIRED', 
        packageId: package1.id,
        status: 'UNUSED',
        createdBy: 'cmg34p9m30000d2mpnlfbbag2',
        expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1天前过期
      }
    })
    
    console.log('✅ 创建过期邀请码:', expiredCode.code)

    // 4. 创建已使用的测试邀请码
    const usedCode = await prisma.activationCode.upsert({
      where: { code: 'TEST2024USED' },
      update: {},
      create: {
        code: 'TEST2024USED',
        packageId: package1.id,
        status: 'USED',
        usedBy: 'cmg34p9m30000d2mpnlfbbag2',
        usedAt: new Date(),
        createdBy: 'cmg34p9m30000d2mpnlfbbag2'
      }
    })
    
    console.log('✅ 创建已使用邀请码:', usedCode.code)

    console.log('\n📋 测试邀请码列表:')
    console.log('• 有效邀请码: TEST2024VALID')
    console.log('• 过期邀请码: TEST2024EXPIRED')  
    console.log('• 已使用邀请码: TEST2024USED')
    console.log('• 不存在邀请码: INVALID123 (应该报错)')
    
  } catch (error) {
    console.error('❌ 创建测试数据失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestData()
