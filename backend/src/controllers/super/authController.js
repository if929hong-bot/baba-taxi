const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const { generateToken } = require('../../utils/jwt')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

// 超級管理員登入
const login = async (req, res) => {
  try {
    const { phone, password } = req.body

    // 驗證輸入
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: '請輸入手機號碼和密碼'
      })
    }

    // 查詢超級管理員
    const admin = await prisma.superAdmin.findUnique({
      where: { phone }
    })

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: '手機號碼或密碼錯誤'
      })
    }

    // 驗證密碼
    const isValidPassword = await bcrypt.compare(password, admin.password)

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '手機號碼或密碼錯誤'
      })
    }

    // 產生 JWT token
    const token = generateToken({
      id: admin.id,
      phone: admin.phone,
      role: 'super-admin'
    })

    // 返回成功（不返回密碼）
    const { password: _, ...adminWithoutPassword } = admin

    res.json({
      success: true,
      message: '登入成功',
      data: {
        token,
        user: adminWithoutPassword
      }
    })

  } catch (error) {
    console.error('超級管理員登入錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

module.exports = {
  login
}