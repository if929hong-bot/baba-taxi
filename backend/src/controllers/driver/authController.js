const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const { generateToken } = require('../../utils/jwt')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

// 司機登入
const login = async (req, res) => {
  try {
    const { phone, password } = req.body

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: '請輸入手機號碼和密碼'
      })
    }

    // 查詢司機
    const driver = await prisma.driver.findUnique({
      where: { phone },
      include: {
        fleet: {
          select: {
            id: true,
            fleetCode: true,
            fleetName: true,
            status: true
          }
        }
      }
    })

    if (!driver) {
      return res.status(401).json({
        success: false,
        message: '手機號碼或密碼錯誤'
      })
    }

    // 檢查帳號狀態
    if (driver.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: '您的帳號已被停權'
      })
    }

    if (driver.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: '您的帳號尚未通過審核'
      })
    }

    if (driver.fleet.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: '所屬車隊目前無法提供服務'
      })
    }

    // 驗證密碼
    const isValidPassword = await bcrypt.compare(password, driver.password)

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '手機號碼或密碼錯誤'
      })
    }

    // 更新最後登入時間
    await prisma.driver.update({
      where: { id: driver.id },
      data: { lastLogin: new Date() }
    })

    // 產生 JWT token
    const token = generateToken({
      id: driver.id,
      fleetId: driver.fleetId,
      fleetCode: driver.fleet.fleetCode,
      phone: driver.phone,
      role: 'driver'
    })

    // 返回成功（不返回密碼）
    const { password: _, ...driverWithoutPassword } = driver

    res.json({
      success: true,
      message: '登入成功',
      data: {
        token,
        user: driverWithoutPassword
      }
    })

  } catch (error) {
    console.error('司機登入錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 忘記密碼 - 驗證手機和信箱
const forgotPassword = async (req, res) => {
  try {
    const { phone, email } = req.body

    if (!phone || !email) {
      return res.status(400).json({
        success: false,
        message: '請輸入手機號碼和電子信箱'
      })
    }

    const driver = await prisma.driver.findFirst({
      where: {
        phone,
        email
      }
    })

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: '找不到符合的手機號碼和信箱'
      })
    }

    // 產生重設密碼的 token
    const resetToken = Math.random().toString(36).substring(2, 15)

    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        resetToken,
        resetTokenExpiry: new Date(Date.now() + 3600000)
      }
    })

    // TODO: 寄送重設密碼 Email

    res.json({
      success: true,
      message: '驗證成功，請輸入新密碼',
      data: { resetToken }
    })

  } catch (error) {
    console.error('忘記密碼錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 重設密碼
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '請提供重設令牌和新密碼'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密碼長度至少 6 碼'
      })
    }

    const driver = await prisma.driver.findFirst({
      where: {
        resetToken,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    })

    if (!driver) {
      return res.status(400).json({
        success: false,
        message: '重設連結已過期或無效'
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    res.json({
      success: true,
      message: '密碼重設成功，請重新登入'
    })

  } catch (error) {
    console.error('重設密碼錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

module.exports = {
  login,
  forgotPassword,
  resetPassword
}