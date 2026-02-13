import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Car,
  Phone,
  Star,
  MapPin,
  Navigation,
  Clock,
  User,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

const Tracking = () => {
  const navigate = useNavigate()
  const { fleetCode } = useParams()
  const [driver, setDriver] = useState(null)
  const [booking, setBooking] = useState(null)
  const [driverLocation, setDriverLocation] = useState({
    lat: 25.0330,
    lng: 121.5654,
    address: '台北車站'
  })
  const [eta, setEta] = useState(5) // 分鐘
  const [status, setStatus] = useState('coming') // coming, arrived, onboard

  useEffect(() => {
    // 取得司機資訊
    const savedDriver = sessionStorage.getItem('driver')
    const savedBooking = sessionStorage.getItem('booking')
    
    if (savedDriver && savedBooking) {
      setDriver(JSON.parse(savedDriver))
      setBooking(JSON.parse(savedBooking))
    } else {
      navigate(`/fleet/${fleetCode}/passenger`)
    }
  }, [navigate, fleetCode])

  // 模擬司機移動
  useEffect(() => {
    const interval = setInterval(() => {
      setEta(prev => Math.max(0, prev - 1))
      
      // 模擬司機抵達
      if (eta === 1) {
        setStatus('arrived')
      }
    }, 10000) // 每10秒減少1分鐘
    return () => clearInterval(interval)
  }, [eta])

  const handleCallDriver = () => {
    if (driver) {
      window.location.href = `tel:${driver.phone}`
    }
  }

  if (!driver || !booking) return null

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

      {/* 地圖區域（模擬） */}
      <div className="h-48 bg-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Car size={48} className="text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Google Maps 整合中</p>
            <p className="text-xs text-gray-500">司機位置即時更新</p>
          </div>
        </div>
        
        {/* 狀態覆蓋 */}
        <div className="absolute top-4 right-4">
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${status === 'coming' && 'bg-blue-100 text-blue-700'}
            ${status === 'arrived' && 'bg-green-100 text-green-700'}
            ${status === 'onboard' && 'bg-purple-100 text-purple-700'}
          `}>
            {status === 'coming' && '司機前往中'}
            {status === 'arrived' && '已抵達'}
            {status === 'onboard' && '行程中'}
          </span>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* ETA 卡片 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">預計抵達時間</h3>
            <div className="flex items-center space-x-1">
              <Clock size={18} className="text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">{eta}</span>
              <span className="text-sm text-gray-500">分鐘</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <MapPin size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">您的上車地點</p>
                <p className="text-sm font-medium">{booking.pickup}</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Navigation size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">司機目前位置</p>
                <p className="text-sm font-medium">{driverLocation.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 司機資訊卡片 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="text-purple-600" size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800">{driver.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center space-x-1">
                  <Star size={14} className="text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{driver.rating}</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-600">{driver.carColor}</span>
              </div>
            </div>
            <button
              onClick={handleCallDriver}
              className="p-3 bg-green-100 rounded-full hover:bg-green-200 transition-colors"
            >
              <Phone size={20} className="text-green-600" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Car size={16} className="text-gray-400" />
              <span className="text-sm font-medium">{driver.carModel}</span>
            </div>
            <p className="text-sm text-gray-600">車牌號碼：{driver.licensePlate}</p>
          </div>
        </div>

        {/* 乘車提示 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
            <div>
              <p className="text-xs text-yellow-700">
                請確認車輛與司機資訊，上車後可與司機確認目的地。
              </p>
              {status === 'arrived' && (
                <p className="text-xs font-medium text-yellow-800 mt-2">
                  司機已抵達，請前往上車地點。
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate(`/fleet/${fleetCode}/passenger`)}
            className="py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            重新叫車
          </button>
          <button
            onClick={() => setStatus('onboard')}
            className="py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            我已上車
          </button>
        </div>

        {/* 完成行程按鈕（測試用） */}
        <button
          onClick={() => {
            sessionStorage.removeItem('booking')
            sessionStorage.removeItem('driver')
            navigate(`/fleet/${fleetCode}/passenger/complete`)
          }}
          className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
        >
          <CheckCircle size={18} />
          <span>完成行程（測試用）</span>
        </button>
      </div>
    </div>
  )
}

export default Tracking