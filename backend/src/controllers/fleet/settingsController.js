const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

// 取得費率設定
const getFareSettings = async (req, res) => {
  try {
    const fleetId = req.user.fleetId

    // 查詢車隊設定
    let settings = await prisma.fleetSettings.findUnique({
      where: { fleetId }
    })

    // 如果沒有設定，建立預設值
    if (!settings) {
      settings = await prisma.fleetSettings.create({
        data: {
          fleetId,
          baseFare: 85,
          perKmRate: 20.0,
          perMinRate: 5.0,
          minFare: 100,
          nightSurcharge: 20,
          nightStart: '23:00',
          nightEnd: '06:00'
        }
      })
    }

    res.json({
      success: true,
      data: settings
    })

  } catch (error) {
    console.error('取得費率設定錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 更新費率設定
const updateFareSettings = async (req, res) => {
  try {
    const fleetId = req.user.fleetId
    const {
      baseFare,
      perKmRate,
      perMinRate,
      minFare,
      nightSurcharge,
      nightStart,
      nightEnd
    } = req.body

    // 驗證輸入
    if (baseFare !== undefined && (baseFare < 0 || isNaN(baseFare))) {
      return res.status(400).json({
        success: false,
        message: '起跳價必須為正整數'
      })
    }

    if (perKmRate !== undefined && (perKmRate < 0 || isNaN(perKmRate))) {
      return res.status(400).json({
        success: false,
        message: '每公里收費必須為正數'
      })
    }

    if (perMinRate !== undefined && (perMinRate < 0 || isNaN(perMinRate))) {
      return res.status(400).json({
        success: false,
        message: '每分鐘等待費必須為正數'
      })
    }

    if (minFare !== undefined && (minFare < 0 || isNaN(minFare))) {
      return res.status(400).json({
        success: false,
        message: '最低收費必須為正整數'
      })
    }

    if (nightSurcharge !== undefined && (nightSurcharge < 0 || isNaN(nightSurcharge))) {
      return res.status(400).json({
        success: false,
        message: '夜間加乘金額必須為正整數'
      })
    }

    // 檢查夜間時間格式
    if (nightStart && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(nightStart)) {
      return res.status(400).json({
        success: false,
        message: '夜間開始時間格式錯誤（請使用 HH:mm 格式）'
      })
    }

    if (nightEnd && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(nightEnd)) {
      return res.status(400).json({
        success: false,
        message: '夜間結束時間格式錯誤（請使用 HH:mm 格式）'
      })
    }

    // 更新設定
    const settings = await prisma.fleetSettings.upsert({
      where: { fleetId },
      update: {
        baseFare: baseFare !== undefined ? parseInt(baseFare) : undefined,
        perKmRate: perKmRate !== undefined ? parseFloat(perKmRate) : undefined,
        perMinRate: perMinRate !== undefined ? parseFloat(perMinRate) : undefined,
        minFare: minFare !== undefined ? parseInt(minFare) : undefined,
        nightSurcharge: nightSurcharge !== undefined ? parseInt(nightSurcharge) : undefined,
        nightStart: nightStart !== undefined ? nightStart : undefined,
        nightEnd: nightEnd !== undefined ? nightEnd : undefined
      },
      create: {
        fleetId,
        baseFare: baseFare || 85,
        perKmRate: perKmRate || 20.0,
        perMinRate: perMinRate || 5.0,
        minFare: minFare || 100,
        nightSurcharge: nightSurcharge || 20,
        nightStart: nightStart || '23:00',
        nightEnd: nightEnd || '06:00'
      }
    })

    res.json({
      success: true,
      message: '費率設定更新成功',
      data: settings
    })

  } catch (error) {
    console.error('更新費率設定錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 計算預估車資（給乘客端用）
const calculateEstimatedFare = async (req, res) => {
  try {
    const { fleetCode, distance, duration } = req.body

    if (!fleetCode) {
      return res.status(400).json({
        success: false,
        message: '請提供車隊編號'
      })
    }

    // 查詢車隊
    const fleet = await prisma.fleet.findUnique({
      where: { fleetCode },
      include: { settings: true }
    })

    if (!fleet) {
      return res.status(404).json({
        success: false,
        message: '找不到該車隊'
      })
    }

    // 使用預設設定
    const settings = fleet.settings || {
      baseFare: 85,
      perKmRate: 20,
      perMinRate: 5,
      minFare: 100
    }

    // 計算車資
    let fare = settings.baseFare

    if (distance) {
      fare += distance * settings.perKmRate
    }

    if (duration) {
      fare += duration * settings.perMinRate
    }

    // 檢查是否低於最低收費
    fare = Math.max(fare, settings.minFare)

    // 檢查是否為夜間時段
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    if (settings.nightStart && settings.nightEnd) {
      const [startHour, startMin] = settings.nightStart.split(':').map(Number)
      const [endHour, endMin] = settings.nightEnd.split(':').map(Number)
      
      const currentMinutes = currentHour * 60 + currentMinute
      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin

      let isNight = false
      if (startMinutes < endMinutes) {
        // 夜間時段在同一天（例如 23:00 - 06:00 跨越午夜）
        isNight = currentMinutes >= startMinutes || currentMinutes < endMinutes
      } else {
        // 夜間時段在同一天（例如 20:00 - 06:00）
        isNight = currentMinutes >= startMinutes || currentMinutes < endMinutes
      }

      if (isNight && settings.nightSurcharge) {
        fare += settings.nightSurcharge
      }
    }

    res.json({
      success: true,
      data: {
        estimatedFare: Math.round(fare),
        details: {
          baseFare: settings.baseFare,
          distanceFee: distance ? Math.round(distance * settings.perKmRate) : 0,
          timeFee: duration ? Math.round(duration * settings.perMinRate) : 0,
          nightSurcharge: 0, // 需要更精確計算
          minFare: settings.minFare
        }
      }
    })

  } catch (error) {
    console.error('計算預估車資錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

module.exports = {
  getFareSettings,
  updateFareSettings,
  calculateEstimatedFare
}