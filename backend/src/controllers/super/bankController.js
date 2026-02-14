const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

// 取得銀行資訊
const getBankInfo = async (req, res) => {
  try {
    const bankInfo = await prisma.bankInfo.findUnique({
      where: { id: 1 }
    })

    if (!bankInfo) {
      return res.status(404).json({
        success: false,
        message: '銀行資訊尚未設定'
      })
    }

    res.json({
      success: true,
      data: bankInfo
    })

  } catch (error) {
    console.error('取得銀行資訊錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 更新銀行資訊
const updateBankInfo = async (req, res) => {
  try {
    const { bankName, branch, accountName, accountNumber } = req.body

    // 驗證輸入
    if (!bankName || !branch || !accountName || !accountNumber) {
      return res.status(400).json({
        success: false,
        message: '請填寫所有銀行資訊欄位'
      })
    }

    // 檢查是否存在，若不存在則建立
    const bankInfo = await prisma.bankInfo.upsert({
      where: { id: 1 },
      update: {
        bankName,
        branch,
        accountName,
        accountNumber,
        updatedBy: req.user.id,
        updatedAt: new Date()
      },
      create: {
        id: 1,
        bankName,
        branch,
        accountName,
        accountNumber,
        updatedBy: req.user.id
      }
    })

    res.json({
      success: true,
      message: '銀行資訊更新成功',
      data: bankInfo
    })

  } catch (error) {
    console.error('更新銀行資訊錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

module.exports = {
  getBankInfo,
  updateBankInfo
}