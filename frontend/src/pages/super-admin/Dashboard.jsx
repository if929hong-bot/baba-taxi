import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Building2, 
  Car, 
  DollarSign,
  AlertCircle
} from 'lucide-react'
import StatCard from '../../components/common/StatCard'
import QuickActions from '../../components/common/QuickActions'

const SuperAdminDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  // 檢查是否已登入
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    
    if (!token || user?.role !== 'super-admin') {
      navigate('/super-admin/login')
    }
  }, [navigate])

  // 模擬載入數據 - 改為空數據
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
      {/* 頁面標題 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">儀表板</h1>
        <p className="text-gray-600">歡迎回來，超級管理員</p>
      </div>

      {/* 統計卡片 - 全部顯示0 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="總車隊數"
          value="0"
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="待審核車隊"
          value="0"
          icon={Building2}
          color="yellow"
        />
        <StatCard
          title="總司機數"
          value="0"
          icon={Car}
          color="green"
        />
        <StatCard
          title="本月租金"
          value="$0"
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* 快速操作區 */}
      <QuickActions />

      {/* 兩欄布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左邊兩欄：待審核列表 - 空狀態 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">待審核車隊</h3>
              <button 
                onClick={() => navigate('/super-admin/fleets/pending')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                查看全部
              </button>
            </div>
            <div className="p-8 text-center">
              <Building2 className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500">目前沒有待審核的車隊</p>
            </div>
          </div>
        </div>

        {/* 右邊一欄：近期活動 - 空狀態 */}
        <div>
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">近期活動</h3>
            </div>
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500">暫無活動記錄</p>
            </div>
          </div>
        </div>
      </div>

      {/* 系統通知 - 空狀態 */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-gray-400 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm font-medium text-gray-600">系統通知</p>
            <p className="text-sm text-gray-500 mt-1">
              目前沒有任何通知
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboard