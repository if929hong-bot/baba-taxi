import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Clock,
  Car,
  MapPin,
  Navigation,
  Phone,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

const Matching = () => {
  const navigate = useNavigate()
  const { fleetCode } = useParams()
  const [time, setTime] = useState(0)
  const [booking, setBooking] = useState(null)
  const [searching, setSearching] = useState(true)

  useEffect(() => {
    // 取得叫車資訊
    const savedBooking = sessionStorage.getItem('booking')
    if (savedBooking) {
      setBooking(JSON.parse(savedBooking))
    } else {
      // 如果沒有叫車資訊，返回首頁
      navigate(`/fleet/${fleetCode}/passenger`)
    }
  }, [navigate, fleetCode])

  // 計時器
  useEffect(() => {
    let interval
    if (searching) {
      interval = setInterval(() => {
        setTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [searching])

  // 模擬配對成功
  useEffect(() => {
    if (time === 5) {
      // 5秒後模擬配對成功
      setSearching(false)
      
      // 模擬司機資料
      const driverInfo = {
        name: '張三',
        phone: '0911-111-111',
        carModel: 'Toyota Altis',
        carColor: '白色',
        licensePlate: 'ABC-1234',
        rating: 4.8
      }
      
      sessionStorage.setItem('driver', JSON.stringify(driverInfo))
      
      // 跳轉到追蹤頁面
      setTimeout(() => {
        navigate(`/fleet/${fleetCode}/passenger/tracking`)
      }, 1000)
    }
  }, [time, navigate, fleetCode])

  const handleCancel = () => {
    if (window.confirm('確定要取消叫車嗎？')) {
      sessionStorage.removeItem('booking')
      navigate(`/fleet/${fleetCode}/passenger`)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!booking) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* 頂部導航 */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="text-purple-600" size={24} />
              <span className="text-xl font-bold text-gray-800">叭叭出行</span>
            </div>
            <span className="text-sm text-gray-500">車隊 {fleetCode}</span>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {/* 動畫圖示 */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Car className="text-purple-600" size={48} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
          </div>

          {/* 狀態文字 */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {searching ? '配對中...' : '配對成功！'}
          </h2>
          <p className="text-gray-600 mb-6">
            {searching 
              ? '正在為您尋找附近的司機' 
              : '已為您找到司機，即將跳轉...'}
          </p>

          {/* 計時器 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <Clock size={20} className="text-gray-400" />
              <span className="text-2xl font-mono text-gray-700">{formatTime(time)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">平均配對時間約 30 秒</p>
          </div>

          {/* 叫車資訊 */}
          <div className="text-left space-y-3 mb-6">
            <div className="flex items-start space-x-2">
              <MapPin size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">上車地點</p>
                <p className="text-sm font-medium">{booking.pickup}</p>
              </div>
            </div>
            {booking.dropoff && (
              <div className="flex items-start space-x-2">
                <Navigation size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">下車地點</p>
                  <p className="text-sm font-medium">{booking.dropoff}</p>
                </div>
              </div>
            )}
            <div className="flex items-start space-x-2">
              <Phone size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">聯絡電話</p>
                <p className="text-sm font-medium">{booking.phone}</p>
              </div>
            </div>
          </div>

          {/* 取消按鈕 */}
          {searching && (
            <button
              onClick={handleCancel}
              className="w-full border-2 border-red-300 text-red-600 py-3 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center space-x-2"
            >
              <XCircle size={18} />
              <span>取消叫車</span>
            </button>
          )}
        </div>

        {/* 提示訊息 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
            <p className="text-xs text-yellow-700">
              配對成功後將顯示司機資訊與即時位置，請稍候。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Matching