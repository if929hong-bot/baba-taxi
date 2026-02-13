import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Car,
  DollarSign,
  Clock,
  AlertCircle,
  Search,
  ChevronRight
} from 'lucide-react'

const PassengerHome = () => {
  const navigate = useNavigate()
  const { fleetCode } = useParams()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    pickup: '',
    dropoff: '',
    phone: ''
  })
  const [errors, setErrors] = useState({})
  const [estimatedFare, setEstimatedFare] = useState(null)
  const [nearbyDrivers, setNearbyDrivers] = useState(0)

  // 模擬附近司機數量
  useEffect(() => {
    setNearbyDrivers(Math.floor(Math.random() * 5) + 1)
  }, [])

  // 模擬車資預估
  useEffect(() => {
    if (formData.pickup && formData.dropoff) {
      // 這裡之後會串接 Google Maps API 計算距離
      const mockFare = Math.floor(Math.random() * 100) + 150
      setEstimatedFare(mockFare)
    } else {
      setEstimatedFare(null)
    }
  }, [formData.pickup, formData.dropoff])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.pickup) {
      newErrors.pickup = '請輸入上車地點'
    }
    
    if (!formData.phone) {
      newErrors.phone = '請輸入聯絡電話'
    } else if (!/^09\d{8}$/.test(formData.phone)) {
      newErrors.phone = '手機號碼格式不正確'
    }
    
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    
    // 模擬叫車
    setTimeout(() => {
      // 將叫車資訊存入 sessionStorage
      sessionStorage.setItem('booking', JSON.stringify({
        ...formData,
        fleetCode,
        timestamp: new Date().toISOString()
      }))
      
      // 跳轉到等待配對頁面
      navigate(`/fleet/${fleetCode}/passenger/matching`)
      setLoading(false)
    }, 1500)
  }

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
        {/* 附近司機提示 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">附近有 {nearbyDrivers} 位司機</span>
            </div>
            <span className="text-xs text-gray-400">即時更新</span>
          </div>
        </div>

        {/* 叫車表單 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">準備叫車</h2>

          {/* 上車地點 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              上車地點 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" size={18} />
              <input
                type="text"
                name="pickup"
                value={formData.pickup}
                onChange={handleChange}
                placeholder="例如：台北車站"
                className={`
                  w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2
                  ${errors.pickup 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-purple-200 focus:border-purple-500'
                  }
                `}
              />
            </div>
            {errors.pickup && (
              <p className="mt-1 text-sm text-red-600">{errors.pickup}</p>
            )}
          </div>

          {/* 下車地點（選填） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              下車地點 <span className="text-gray-400 text-xs">(選填)</span>
            </label>
            <div className="relative">
              <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600" size={18} />
              <input
                type="text"
                name="dropoff"
                value={formData.dropoff}
                onChange={handleChange}
                placeholder="例如：101大樓"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
              />
            </div>
          </div>

          {/* 聯絡電話 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              聯絡電話 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0912-345-678"
                className={`
                  w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2
                  ${errors.phone 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-purple-200 focus:border-purple-500'
                  }
                `}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* 車資預估 */}
          {estimatedFare && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <DollarSign size={18} className="text-purple-600" />
                  <span className="text-sm text-purple-700">預估車資</span>
                </div>
                <span className="text-2xl font-bold text-purple-600">${estimatedFare}</span>
              </div>
              <p className="text-xs text-purple-500 mt-1">實際費用可能因路況調整</p>
            </div>
          )}

          {/* 注意事項 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
              <p className="text-xs text-yellow-700">
                確認叫車後，系統將為您配對附近的司機。配對成功後可查看司機即時位置。
              </p>
            </div>
          </div>

          {/* 叫車按鈕 */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full bg-purple-600 text-white py-4 rounded-xl font-medium text-lg
              flex items-center justify-center space-x-2
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-purple-700 transition-colors'}
            `}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>配對中...</span>
              </>
            ) : (
              <>
                <Search size={20} />
                <span>確認叫車</span>
              </>
            )}
          </button>
        </form>

        {/* 服務特色 */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock size={18} className="text-purple-600" />
            </div>
            <p className="text-xs text-gray-600">快速配對</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Car size={18} className="text-green-600" />
            </div>
            <p className="text-xs text-gray-600">即時追蹤</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <DollarSign size={18} className="text-blue-600" />
            </div>
            <p className="text-xs text-gray-600">價格透明</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PassengerHome