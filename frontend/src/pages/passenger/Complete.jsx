import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  CheckCircle,
  Car,
  DollarSign,
  Clock,
  MapPin,
  Navigation,
  Star,
  Home,
  RefreshCw
} from 'lucide-react'

const Complete = () => {
  const navigate = useNavigate()
  const { fleetCode } = useParams()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [showThankYou, setShowThankYou] = useState(false)

  useEffect(() => {
    // 清除 session 中的叫車資訊
    sessionStorage.removeItem('booking')
    sessionStorage.removeItem('driver')
  }, [])

  const handleRate = (value) => {
    setRating(value)
    setShowThankYou(true)
    
    // 3秒後自動返回首頁
    setTimeout(() => {
      navigate(`/fleet/${fleetCode}/passenger`)
    }, 3000)
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
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {/* 成功圖示 */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            行程已完成！
          </h2>
          <p className="text-gray-600 mb-8">
            感謝您使用叭叭出行，祝您旅途愉快
          </p>

          {/* 行程摘要 */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-800 mb-4">行程摘要</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-start space-x-2">
                <MapPin size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">上車地點</p>
                  <p className="text-sm">台北市大安區信義路100號</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Navigation size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">下車地點</p>
                  <p className="text-sm">台北市信義區松高路300號</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center py-3 border-t">
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">行程時間</span>
              </div>
              <span className="font-medium">15 分鐘</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-t">
              <div className="flex items-center space-x-2">
                <DollarSign size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">行程費用</span>
              </div>
              <span className="text-xl font-bold text-purple-600">$185</span>
            </div>
          </div>

          {/* 評分區域 */}
          {!showThankYou ? (
            <>
              <h3 className="font-semibold text-gray-800 mb-4">
                為司機評分
              </h3>
              
              <div className="flex justify-center space-x-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={`
                        transition-colors cursor-pointer
                        ${(hoverRating || rating) >= star 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                        }
                      `}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                點擊星星為司機評分
              </p>
            </>
          ) : (
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-purple-700 font-medium">感謝您的評分！</p>
              <p className="text-sm text-purple-600 mt-1">即將返回首頁...</p>
            </div>
          )}
        </div>

        {/* 操作按鈕 */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate(`/fleet/${fleetCode}/passenger`)}
            className="py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Home size={18} />
            <span>返回首頁</span>
          </button>
          <button
            onClick={() => navigate(`/fleet/${fleetCode}/passenger`)}
            className="py-3 border border-purple-300 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw size={18} />
            <span>再叫一單</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Complete