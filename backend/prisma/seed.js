const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')

dotenv.config()

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({
  adapter
})

async function main() {
  console.log('開始建立種子資料...')

  // 先建立三組超級管理員（這樣才有 updater 可以用）
  console.log('建立超級管理員...')
  const superAdmins = [
    { phone: '0975521219', password: 'sgm0975521219', name: '超級管理員1' },
    { phone: '0982098079', password: 'sgm0982098079', name: '超級管理員2' },
    { phone: '0911123456', password: 'sgm0911123456', name: '超級管理員3' }
  ]

  const createdAdmins = []
  for (const admin of superAdmins) {
    const hashedPassword = await bcrypt.hash(admin.password, 10)
    const created = await prisma.superAdmin.upsert({
      where: { phone: admin.phone },
      update: {},
      create: {
        phone: admin.phone,
        password: hashedPassword,
        name: admin.name
      }
    })
    createdAdmins.push(created)
    console.log(`✅ 超級管理員 ${admin.phone} 建立完成`)
  }

  // 使用第一個超級管理員作為 updater
  const firstAdmin = createdAdmins[0]

  // 建立預設銀行資訊（需要關聯一個超級管理員）
  await prisma.bankInfo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      bankName: '第一商業銀行',
      branch: '敦化分行',
      accountName: '叭叭出行股份有限公司',
      accountNumber: '123-456-789012',
      updater: {
        connect: { id: firstAdmin.id }  // 關聯到第一個超級管理員
      }
    }
  })
  console.log('✅ 銀行資訊建立完成')

  console.log('🎉 所有種子資料建立完成！')
}

main()
  .catch((e) => {
    console.error('❌ 種子資料建立失敗：', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })