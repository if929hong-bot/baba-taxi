import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Users, 
  Car, 
  DollarSign,
  Clock,
  AlertCircle
} from 'lucide-react'
import StatCard from '../../components/common/StatCard'

const FleetDashboard = () => {
  const navigate = useNavigate()
  const { fleetCode } = useParams()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    
    if (!token || user?.role !== 'fleet-admin') {
      navigate('/fleet/login')
    }
  }, [navigate])

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">儀表板</h1>
        <p className="text-gray-600">車隊編號：{fleetCode}</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="總司機數"
          value="0"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="線上司機"
          value="0"
          icon={Car}
          color="green"
        />
        <StatCard
          title="待審核司機"
          value="0"
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="本日收入"
          value="$0"
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* 待審核司機 */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">待審核司機</h3>
          <button 
            onClick={() => navigate(`/fleet/${fleetCode}/admin/drivers/pending`)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            查看全部
          </button>
        </div>
        <div className="p-8 text-center">
          <Users className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500">目前沒有待審核的司機</p>
        </div>
      </div>

      {/* 今日訂單 */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-800">今日訂單</h3>
        </div>
        <div className="p-8 text-center">
          <AlertCircle className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500">今日尚無訂單</p>
        </div>
      </div>
    </div>
  )
}

export default FleetDashboard