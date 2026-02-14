const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const { generateToken } = require('../../utils/jwt')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

// 車隊管理員註冊
const register = async (req, res) => {
  try {
    const { fleetName, managerName, phone, email, password } = req.body

    // 驗證輸入
    if (!fleetName || !managerName || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '請填寫所有必填欄位'
      })
    }

    // 檢查手機號碼是否已被註冊
    const existingManager = await prisma.fleetManager.findUnique({
      where: { phone }
    })

    if (existingManager) {
      return res.status(400).json({
        success: false,
        message: '此手機號碼已被註冊'
      })
    }

    // 檢查信箱是否已被註冊
    const existingEmail = await prisma.fleetManager.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: '此電子信箱已被註冊'
      })
    }

    // 檢查車隊名稱是否已被使用
    const existingFleet = await prisma.fleet.findUnique({
      where: { fleetName }
    })

    if (existingFleet) {
      return res.status(400).json({
        success: false,
        message: '此車隊名稱已被使用'
      })
    }

    // 產生車隊編號（F001, F002...）
    const lastFleet = await prisma.fleet.findFirst({
      orderBy: { fleetCode: 'desc' }
    })

    let fleetCode = 'F001'
    if (lastFleet) {
      const lastNumber = parseInt(lastFleet.fleetCode.substring(1))
      fleetCode = `F${String(lastNumber + 1).padStart(3, '0')}`
    }

    // 密碼加密
    const hashedPassword = await bcrypt.hash(password, 10)

    // 開始交易：建立車隊和車隊管理員
    const result = await prisma.$transaction(async (tx) => {
      // 建立車隊
      const fleet = await tx.fleet.create({
        data: {
          fleetCode,
          fleetName,
          status: 'pending'
        }
      })

      // 建立車隊管理員
      const manager = await tx.fleetManager.create({
        data: {
          fleetId: fleet.id,
          name: managerName,
          phone,
          email,
          password: hashedPassword,
          status: 'pending'
        }
      })

      // 建立預設車隊設定
      await tx.fleetSettings.create({
        data: {
          fleetId: fleet.id
        }
      })

      return { fleet, manager }
    })

    res.status(201).json({
      success: true,
      message: '註冊成功，請等待超級管理員審核',
      data: {
        fleetCode: result.fleet.fleetCode,
        fleetName: result.fleet.fleetName,
        managerName: result.manager.name
      }
    })

  } catch (error) {
    console.error('車隊管理員註冊錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 車隊管理員登入
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

    // 查詢車隊管理員
    const manager = await prisma.fleetManager.findUnique({
      where: { phone },
      include: {
        fleet: true
      }
    })

    if (!manager) {
      return res.status(401).json({
        success: false,
        message: '手機號碼或密碼錯誤'
      })
    }

    // 檢查帳號狀態
    if (manager.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: '您的帳號已被停權'
      })
    }

    if (manager.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: '您的帳號尚未通過審核'
      })
    }

    // 驗證密碼
    const isValidPassword = await bcrypt.compare(password, manager.password)

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '手機號碼或密碼錯誤'
      })
    }

    // 更新最後登入時間
    await prisma.fleetManager.update({
      where: { id: manager.id },
      data: { lastLogin: new Date() }
    })

    // 產生 JWT token
    const token = generateToken({
      id: manager.id,
      fleetId: manager.fleetId,
      fleetCode: manager.fleet.fleetCode,
      phone: manager.phone,
      role: 'fleet-admin'
    })

    // 返回成功（不返回密碼）
    const { password: _, ...managerWithoutPassword } = manager

    res.json({
      success: true,
      message: '登入成功',
      data: {
        token,
        user: {
          ...managerWithoutPassword,
          fleet: {
            id: manager.fleet.id,
            fleetCode: manager.fleet.fleetCode,
            fleetName: manager.fleet.fleetName,
            status: manager.fleet.status
          }
        }
      }
    })

  } catch (error) {
    console.error('車隊管理員登入錯誤：', error)
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

    // 查詢車隊管理員
    const manager = await prisma.fleetManager.findFirst({
      where: {
        phone,
        email
      }
    })

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: '找不到符合的手機號碼和信箱'
      })
    }

    // 產生重設密碼的 token（實際應用中會寄送 Email）
    const resetToken = Math.random().toString(36).substring(2, 15)

    // 儲存重設 token（過期時間 1 小時）
    await prisma.fleetManager.update({
      where: { id: manager.id },
      data: {
        resetToken,
        resetTokenExpiry: new Date(Date.now() + 3600000)
      }
    })

    // TODO: 寄送重設密碼 Email

    res.json({
      success: true,
      message: '驗證成功，請輸入新密碼',
      data: {
        resetToken // 實際應用中不應該返回，這裡只是方便測試
      }
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

    // 查詢重設令牌
    const manager = await prisma.fleetManager.findFirst({
      where: {
        resetToken,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    })

    if (!manager) {
      return res.status(400).json({
        success: false,
        message: '重設連結已過期或無效'
      })
    }

    // 加密新密碼
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 更新密碼並清除重設令牌
    await prisma.fleetManager.update({
      where: { id: manager.id },
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
  register,
  login,
  forgotPassword,
  resetPassword
}