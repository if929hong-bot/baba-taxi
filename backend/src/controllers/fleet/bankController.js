const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

// 取得銀行資訊（唯讀）
const getBankInfo = async (req, res) => {
  try {
    const bankInfo = await prisma.bankInfo.findUnique({
      where: { id: 1 },
      include: {
        updater: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    })

    if (!bankInfo) {
      return res.status(404).json({
        success: false,
        message: '銀行資訊尚未設定'
      })
    }

    // 移除敏感資訊（如果需要）
    const { updatedBy, ...safeBankInfo } = bankInfo

    res.json({
      success: true,
      data: safeBankInfo
    })

  } catch (error) {
    console.error('取得銀行資訊錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

module.exports = {
  getBankInfo
}