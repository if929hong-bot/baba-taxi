import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Navigation, 
  Phone,
  Car,
  User,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react'

const TaskHall = () => {
  const navigate = useNavigate()
  const { fleetCode } = useParams()
  const [loading, setLoading] = useState(true)
  const [online, setOnline] = useState(false)
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    
    if (!token || user?.role !== 'driver') {
      navigate(`/fleet/${fleetCode}/driver/login`)
    }
  }, [navigate, fleetCode])

  // 模擬載入任務
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const mockTasks = []
      setTasks(mockTasks)
      setLoading(false)
    }, 1000)
  }, [])

  const handleToggleOnline = () => {
    setOnline(!online)
    // 這裡之後會串接 API 更新司機狀態
  }

  const handleGrabTask = (taskId) => {
    console.log('搶單', taskId)
    // 這裡之後會串接搶單 API
    navigate(`/fleet/${fleetCode}/driver/task/${taskId}`)
  }

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
      {/* 上線/下線開關 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">目前狀態</h2>
            <p className="text-sm text-gray-500">開啟後即可接收附近乘客的訂單</p>
          </div>
          <button
            onClick={handleToggleOnline}
            className={`
              relative inline-flex h-8 w-14 items-center rounded-full transition-colors
              ${online ? 'bg-green-600' : 'bg-gray-300'}
            `}
          >
            <span
              className={`
                inline-block h-6 w-6 transform rounded-full bg-white transition-transform
                ${online ? 'translate-x-7' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>

      {/* 狀態提示 */}
      {!online && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle size={20} className="text-yellow-600" />
            <p className="text-sm text-yellow-700">您目前為離線狀態，開啟上線即可開始接單</p>
          </div>
        </div>
      )}

      {/* 任務列表 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">附近任務</h3>
          <button className="text-sm text-yellow-600 hover:text-yellow-700 flex items-center space-x-1">
            <RefreshCw size={16} />
            <span>重新整理</span>
          </button>
        </div>

        {online ? (
          tasks.length > 0 ? (
            <div className="divide-y">
              {tasks.map((task) => (
                <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="text-sm font-medium">{task.pickup}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Navigation size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{task.dropoff}</span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">${task.fare}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-2">
                      <User size={14} />
                      <span>{task.passengerName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{task.distance}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleGrabTask(task.id)}
                    className="w-full bg-yellow-600 text-white py-3 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                  >
                    我要搶單
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Car className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 mb-2">目前附近沒有任務</p>
              <p className="text-sm text-gray-400">請稍後再試，或擴大服務範圍</p>
            </div>
          )
        ) : (
          <div className="p-12 text-center">
            <AlertCircle className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 mb-2">請先開啟上線狀態</p>
            <p className="text-sm text-gray-400">開啟後即可看到附近乘客的訂單</p>
          </div>
        )}
      </div>

      {/* 今日小計 */}
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl shadow-sm p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">今日收入</h3>
          <DollarSign size={20} />
        </div>
        <p className="text-3xl font-bold mb-2">$0</p>
        <p className="text-sm opacity-90">完成訂單：0 趟</p>
      </div>
    </div>
  )
}

export default TaskHall