import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  DollarSign,
  TrendingUp,
  Clock,
  Car,
  Calendar,
  ChevronRight,
  MapPin,
  Navigation
} from 'lucide-react'

const TodayIncome = () => {
  const navigate = useNavigate()
  const { fleetCode } = useParams()
  const [loading, setLoading] = useState(true)
  const [income, setIncome] = useState({
    total: 0,
    cash: 0,
    street: 0,
    trips: 0,
    hours: 0
  })
  const [recentTasks, setRecentTasks] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    
    if (!token || user?.role !== 'driver') {
      navigate(`/fleet/${fleetCode}/driver/login`)
    }
  }, [navigate, fleetCode])

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setIncome({
        total: 0,
        cash: 0,
        street: 0,
        trips: 0,
        hours: 0
      })
      setRecentTasks([])
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">今日收入</h1>
        <p className="text-gray-600 mt-1">即時更新今日營收統計</p>
      </div>

      {/* 主要收入卡片 */}
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl shadow-sm p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">總收入</h3>
          <DollarSign size={24} />
        </div>
        <p className="text-4xl font-bold mb-2">$0</p>
        <p className="text-sm opacity-90">完成訂單：0 趟</p>
      </div>

      {/* 收入明細 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">現金</span>
            <DollarSign size={18} className="text-green-600" />
          </div>
          <p className="text-xl font-bold text-gray-800">$0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">街口</span>
            <DollarSign size={18} className="text-blue-600" />
          </div>
          <p className="text-xl font-bold text-gray-800">$0</p>
        </div>
      </div>

      {/* 其他統計 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock size={16} className="text-gray-400" />
            <span className="text-sm text-gray-500">上線時數</span>
          </div>
          <p className="text-xl font-bold text-gray-800">0 小時</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp size={16} className="text-gray-400" />
            <span className="text-sm text-gray-500">平均每趟</span>
          </div>
          <p className="text-xl font-bold text-gray-800">$0</p>
        </div>
      </div>

      {/* 近期任務 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">近期任務</h3>
          <button 
            onClick={() => navigate(`/fleet/${fleetCode}/driver/tasks`)}
            className="text-sm text-yellow-600 hover:text-yellow-700 flex items-center space-x-1"
          >
            <span>查看全部</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {recentTasks.length > 0 ? (
          <div className="divide-y">
            {recentTasks.map((task) => (
              <div key={task.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-1">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{task.time}</span>
                  </div>
                  <span className="font-medium text-yellow-600">${task.fare}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-start space-x-1 text-xs">
                    <MapPin size={12} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 truncate">{task.pickup}</span>
                  </div>
                  <div className="flex items-start space-x-1 text-xs">
                    <Navigation size={12} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 truncate">{task.dropoff}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Car className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-sm text-gray-500">今日尚無完成訂單</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TodayIncome