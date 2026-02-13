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
  CheckCircle,
  Camera,
  CreditCard,
  Landmark
} from 'lucide-react'

const TaskDetail = () => {
  const navigate = useNavigate()
  const { fleetCode, taskId } = useParams()
  const [loading, setLoading] = useState(true)
  const [task, setTask] = useState(null)
  const [status, setStatus] = useState('accepted') // accepted, picked_up, driving, arrived
  const [timer, setTimer] = useState(0)
  const [fare, setFare] = useState(0)

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
      const mockTask = {
        id: taskId,
        passengerName: '張先生',
        passengerPhone: '0912-345-678',
        pickup: '台北市大安區信義路100號',
        dropoff: '台北市信義區松高路300號',
        distance: '3.5公里',
        estimatedFare: 185,
        note: '請幫忙搬行李'
      }
      setTask(mockTask)
      setFare(mockTask.estimatedFare)
      setLoading(false)
    }, 1000)
  }, [taskId])

  // 計時器
  useEffect(() => {
    let interval
    if (status === 'driving') {
      interval = setInterval(() => {
        setTimer(prev => prev + 1)
        // 每分鐘加價（之後可串接費率設定）
        if (timer > 0 && timer % 60 === 0) {
          setFare(prev => prev + 5)
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [status, timer])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePassengerPickedUp = () => {
    setStatus('driving')
    setTimer(0)
  }

  const handleArrived = () => {
    setStatus('arrived')
  }

  const handlePayment = (method) => {
    console.log('付款方式：', method)
    // 顯示截圖提醒
    alert('請記得截圖保存收費明細，以利後續對帳')
    // 完成訂單，返回任務大廳
    navigate(`/fleet/${fleetCode}/driver`)
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
      {/* 狀態標籤 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">訂單狀態</span>
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${status === 'accepted' && 'bg-blue-100 text-blue-700'}
            ${status === 'picked_up' && 'bg-yellow-100 text-yellow-700'}
            ${status === 'driving' && 'bg-green-100 text-green-700'}
            ${status === 'arrived' && 'bg-purple-100 text-purple-700'}
          `}>
            {status === 'accepted' && '已接單'}
            {status === 'picked_up' && '乘客已上車'}
            {status === 'driving' && '行程中'}
            {status === 'arrived' && '已抵達'}
          </span>
        </div>
      </div>

      {/* 乘客資訊 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <User className="text-yellow-600" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{task.passengerName}</h3>
            <a href={`tel:${task.passengerPhone}`} className="text-sm text-yellow-600 flex items-center space-x-1">
              <Phone size={14} />
              <span>{task.passengerPhone}</span>
            </a>
          </div>
        </div>

        {/* 上下車地點 */}
        <div className="space-y-3 mb-4">
          <div className="flex items-start space-x-3">
            <MapPin size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">上車地點</p>
              <p className="text-sm font-medium">{task.pickup}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Navigation size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">下車地點</p>
              <p className="text-sm font-medium">{task.dropoff}</p>
            </div>
          </div>
        </div>

        {task.note && (
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-xs text-yellow-700">{task.note}</p>
          </div>
        )}
      </div>

      {/* 行程計費 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">行程計費</h3>
          {status === 'driving' && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Clock size={16} />
              <span>{formatTime(timer)}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">起跳價</span>
            <span className="font-medium">$85</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">里程費</span>
            <span className="font-medium">$100</span>
          </div>
          {timer > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">等待/時間費</span>
              <span className="font-medium">${Math.floor(timer / 60) * 5}</span>
            </div>
          )}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold">
              <span>總計</span>
              <span className="text-yellow-600">${fare}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="space-y-3">
        {status === 'accepted' && (
          <button
            onClick={handlePassengerPickedUp}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            乘客已上車
          </button>
        )}

        {status === 'driving' && (
          <button
            onClick={handleArrived}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            到達目的地
          </button>
        )}

        {status === 'arrived' && (
          <>
            <button
              onClick={() => handlePayment('cash')}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <DollarSign size={18} />
              <span>現金付款</span>
            </button>
            <button
              onClick={() => handlePayment('street')}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Landmark size={18} />
              <span>街口支付</span>
            </button>
          </>
        )}
      </div>

      {/* 截圖提醒 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Camera size={16} className="text-yellow-600 mt-0.5" />
          <p className="text-xs text-yellow-700">
            完成訂單後請截圖保存收費明細，以利後續對帳
          </p>
        </div>
      </div>
    </div>
  )
}

export default TaskDetail